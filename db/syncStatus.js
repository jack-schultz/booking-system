import { getActiveAccount, getAccountDisplayName, hasAssignedRestaurant } from '../auth/accounts.js';
import { isOnline } from '../config/connectivity.js';

const POWERSYNC_URL = import.meta.env.VITE_POWERSYNC_URL;

function isSyncConfigured() {
    return Boolean(POWERSYNC_URL);
}

const MAX_ISSUES = 20;
const MAX_DOWNLOAD_LOG = 20;

/** @type {Array<{ type: string, message: string, detail?: unknown, at: string }>} */
const issueLog = [];

/** @type {Array<{ at: string, operations?: number, lastSyncedAt?: string }>} */
const downloadActivityLog = [];

let dbInstance = null;
let statusListenerDispose = null;
let wasDownloading = false;
/** @type {Set<(snapshot: Awaited<ReturnType<typeof buildSnapshot>>) => void>} */
const subscribers = new Set();
let bootstrapPromise = null;

/**
 * @param {{ type: string, message: string, detail?: unknown }} issue
 */
export function recordSyncIssue({ type, message, detail }) {
    issueLog.unshift({
        type,
        message,
        detail,
        at: new Date().toISOString(),
    });
    if (issueLog.length > MAX_ISSUES) {
        issueLog.length = MAX_ISSUES;
    }
    void notifySubscribers();
}

export function getRecentIssues() {
    return [...issueLog];
}

export function getDownloadActivityLog() {
    return [...downloadActivityLog];
}

/**
 * @param {{
 *   online: boolean,
 *   status?: import('@powersync/common').SyncStatus | null,
 *   uploadQueueCount?: number,
 *   syncConfigured?: boolean,
 *   hasRestaurant?: boolean,
 *   hasAccount?: boolean,
 * }} snapshot
 * @returns {'offline' | 'warning' | 'ok'}
 */
export function computeSyncHealth({
    online,
    status,
    uploadQueueCount = 0,
    syncConfigured = false,
    hasRestaurant = false,
    hasAccount = false,
}) {
    if (!online) {
        return 'offline';
    }

    const flow = status?.dataFlowStatus ?? {};
    const hasError = Boolean(flow.downloadError || flow.uploadError);
    const isActive = Boolean(status?.connecting || flow.downloading || flow.uploading);
    const shouldSync = syncConfigured && hasRestaurant;
    const notReady = shouldSync && !status?.connected;

    if (
        hasError ||
        isActive ||
        uploadQueueCount > 0 ||
        notReady ||
        (syncConfigured && hasAccount && !hasRestaurant)
    ) {
        return 'warning';
    }

    return 'ok';
}

function trackDownloadActivity(status) {
    const downloading = Boolean(status?.dataFlowStatus?.downloading);

    if (wasDownloading && !downloading) {
        const progress = status?.downloadProgress;
        downloadActivityLog.unshift({
            at: new Date().toISOString(),
            operations: progress?.downloadedOperations,
            lastSyncedAt: status?.lastSyncedAt?.toISOString(),
        });
        if (downloadActivityLog.length > MAX_DOWNLOAD_LOG) {
            downloadActivityLog.length = MAX_DOWNLOAD_LOG;
        }
    }

    wasDownloading = downloading;
}

async function getPendingUploads(db) {
    const batch = await db.getCrudBatch(100);
    if (!batch) {
        return [];
    }

    return batch.crud.map((entry) => ({
        table: entry.table,
        op: entry.op,
        id: entry.id,
        transactionId: entry.transactionId,
        opData: entry.opData ?? {},
    }));
}

async function buildSnapshot() {
    const account = getActiveAccount();
    const online = isOnline();
    const syncConfigured = isSyncConfigured();
    const assignedRestaurant = hasAssignedRestaurant(account);

    let status = null;
    let uploadQueueStats = { count: 0, size: null };
    let pendingUploads = [];
    let bookingCount = null;
    let sdkVersion = null;

    if (dbInstance) {
        status = dbInstance.currentStatus;
        sdkVersion = dbInstance.sdkVersion;

        try {
            uploadQueueStats = await dbInstance.getUploadQueueStats(true);
            pendingUploads = await getPendingUploads(dbInstance);
        } catch (err) {
            console.warn('Failed to read upload queue:', err);
        }

        if (assignedRestaurant && account?.restaurant_id != null) {
            try {
                const result = await dbInstance.getOptional(
                    'SELECT COUNT(*) AS count FROM bookings WHERE restaurant_id = ?',
                    [account.restaurant_id]
                );
                bookingCount = result?.count ?? 0;
            } catch (err) {
                console.warn('Failed to count bookings:', err);
            }
        }
    }

    const health = computeSyncHealth({
        online,
        status,
        uploadQueueCount: uploadQueueStats.count ?? 0,
        syncConfigured,
        hasRestaurant: assignedRestaurant,
        hasAccount: Boolean(account),
    });

    return {
        health,
        online,
        syncConfigured,
        connected: status?.connected ?? false,
        connecting: status?.connecting ?? false,
        hasSynced: status?.hasSynced,
        lastSyncedAt: status?.lastSyncedAt?.toISOString() ?? null,
        statusMessage: status?.getMessage?.() ?? null,
        dataFlowStatus: status?.dataFlowStatus ?? null,
        downloadProgress: status?.downloadProgress ?? null,
        syncStreams: status?.syncStreams ?? null,
        uploadQueueCount: uploadQueueStats.count ?? 0,
        uploadQueueSize: uploadQueueStats.size ?? null,
        pendingUploads,
        bookingCount,
        sdkVersion,
        accountName: getAccountDisplayName(account),
        restaurantId: account?.restaurant_id ?? null,
        hasRestaurant: assignedRestaurant,
    };
}

export async function getSyncSnapshot() {
    return buildSnapshot();
}

async function notifySubscribers() {
    const snapshot = await buildSnapshot();
    for (const callback of subscribers) {
        callback(snapshot);
    }
}

async function ensureDbSubscribed() {
    if (statusListenerDispose) {
        return;
    }

    const account = getActiveAccount();
    if (!account) {
        return;
    }

    const { initDatabase } = await import('./index.js');
    dbInstance = await initDatabase();

    statusListenerDispose = dbInstance.registerListener({
        statusChanged: (status) => {
            trackDownloadActivity(status);
            void notifySubscribers();
        },
    });

    wasDownloading = Boolean(dbInstance.currentStatus?.dataFlowStatus?.downloading);
}

function bootstrap() {
    if (!bootstrapPromise) {
        bootstrapPromise = ensureDbSubscribed()
            .then(() => notifySubscribers())
            .catch((err) => {
                console.warn('Sync status bootstrap failed:', err);
                bootstrapPromise = null;
            });
    }
    return bootstrapPromise;
}

/**
 * @param {(snapshot: Awaited<ReturnType<typeof buildSnapshot>>) => void} callback
 * @returns {() => void}
 */
export function subscribeSyncStatus(callback) {
    subscribers.add(callback);

    function onConnectivityChange() {
        void notifySubscribers();
    }

    window.addEventListener('online', onConnectivityChange);
    window.addEventListener('offline', onConnectivityChange);

    void buildSnapshot().then(callback);
    void bootstrap();

    return () => {
        subscribers.delete(callback);
        window.removeEventListener('online', onConnectivityChange);
        window.removeEventListener('offline', onConnectivityChange);
    };
}
