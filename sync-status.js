import './pwa/register.js';
import { initAccountSwitcher } from './auth/accountSwitcher.js';
import { mountSiteNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';
import {
    initDatabase,
    ensureSyncConnected,
    reconnectSync,
} from './db/index.js';
import {
    subscribeSyncStatus,
    getRecentIssues,
    getDownloadActivityLog,
} from './db/syncStatus.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), { showAuthControls: true, showSyncIndicator: true });
mountSiteFooter(document.getElementById('site-footer-mount'));

const summaryEl = document.getElementById('sync-status-summary');
const uploadsEl = document.getElementById('sync-status-uploads-list');
const downloadsEl = document.getElementById('sync-status-downloads-list');
const issuesEl = document.getElementById('sync-status-issues-list');
const reconnectBtn = document.getElementById('sync-status-reconnect-btn');

await initAccountSwitcher({ requireAuth: true, loginRedirect: 'login.html' });

const db = await initDatabase();
void ensureSyncConnected(db);

function setReconnectButtonIdle(reconnectResult) {
    reconnectBtn.disabled = false;
    if (!navigator.onLine) {
        reconnectBtn.textContent = 'Offline';
    } else if (reconnectResult && db.connected) {
        reconnectBtn.textContent = 'Reconnect';
    } else {
        reconnectBtn.textContent = 'Failed to connect';
    }
}

reconnectBtn.addEventListener('click', async () => {
    reconnectBtn.disabled = true;
    reconnectBtn.textContent = 'Reconnecting...';
    let reconnectResult = null;
    try {
        reconnectResult = await reconnectSync(db);
    } finally {
        setReconnectButtonIdle(reconnectResult);
    }
});

window.addEventListener('online', () => {
    if (reconnectBtn.textContent === 'Offline') {
        reconnectBtn.textContent = 'Reconnect';
    }
});

function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
}

function formatBytes(bytes) {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} kB`;
}

function healthLabel(health) {
    if (health === 'offline') return 'Offline';
    if (health === 'warning') return 'Attention needed';
    return 'Up to date';
}

function renderSummary(snapshot) {
    const connectionState = snapshot.online
        ? snapshot.connected
            ? 'Connected'
            : snapshot.connecting
              ? 'Connecting…'
              : 'Disconnected'
        : 'Offline';

    summaryEl.innerHTML = `
        <div class="sync-status-metric sync-status-metric--${snapshot.health}">
            <span class="sync-status-metric-label">Status</span>
            <span class="sync-status-metric-value">${healthLabel(snapshot.health)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Connection</span>
            <span class="sync-status-metric-value">${connectionState}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Last synced</span>
            <span class="sync-status-metric-value">${formatDateTime(snapshot.lastSyncedAt)}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Pending uploads</span>
            <span class="sync-status-metric-value">${snapshot.uploadQueueCount}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Local bookings</span>
            <span class="sync-status-metric-value">${snapshot.bookingCount ?? '—'}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Sync mode</span>
            <span class="sync-status-metric-value">${snapshot.syncConfigured ? 'PowerSync' : 'Local only'}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Restaurant</span>
            <span class="sync-status-metric-value">${snapshot.hasRestaurant ? snapshot.restaurantId : 'Not assigned'}</span>
        </div>
        <div class="sync-status-metric">
            <span class="sync-status-metric-label">Account</span>
            <span class="sync-status-metric-value">${snapshot.accountName}</span>
        </div>
    `;

    if (snapshot.statusMessage) {
        summaryEl.insertAdjacentHTML(
            'beforeend',
            `<p class="sync-status-message">${escapeHtml(snapshot.statusMessage)}</p>`
        );
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderUploadItem(entry) {
    const name = [entry.opData?.first_name, entry.opData?.last_name].filter(Boolean).join(' ');
    const datetime = entry.opData?.datetime ?? '';
    const status = entry.opData?.status ?? '';

    return `
        <article class="sync-status-item">
            <div class="sync-status-item-header">
                <span class="sync-status-op-badge sync-status-op-badge--${entry.op.toLowerCase()}">${entry.op}</span>
                <span class="sync-status-item-id">${escapeHtml(entry.id)}</span>
            </div>
            ${name ? `<p class="sync-status-item-detail">${escapeHtml(name)}</p>` : ''}
            ${datetime ? `<p class="sync-status-item-detail">${escapeHtml(datetime)}</p>` : ''}
            ${status ? `<p class="sync-status-item-detail">Status: ${escapeHtml(status)}</p>` : ''}
            <p class="sync-status-item-meta">Table: ${escapeHtml(entry.table)}</p>
        </article>
    `;
}

function renderUploads(snapshot) {
    if (snapshot.pendingUploads.length === 0) {
        const sizeNote =
            snapshot.uploadQueueSize != null ? ` (${formatBytes(snapshot.uploadQueueSize)})` : '';
        uploadsEl.innerHTML = `<p class="sync-status-empty">No pending uploads${sizeNote}</p>`;
        return;
    }

    const sizeNote =
        snapshot.uploadQueueSize != null
            ? `<p class="sync-status-queue-size">Queue size: ${formatBytes(snapshot.uploadQueueSize)}</p>`
            : '';

    uploadsEl.innerHTML =
        sizeNote + snapshot.pendingUploads.map(renderUploadItem).join('');
}

function renderDownloads(snapshot) {
    const parts = [];
    const flow = snapshot.dataFlowStatus ?? {};

    if (flow.downloading && snapshot.downloadProgress) {
        const pct = Math.round(snapshot.downloadProgress.downloadedFraction * 100);
        parts.push(`
            <div class="sync-status-download-progress">
                <p>Downloading… ${snapshot.downloadProgress.downloadedOperations} / ${snapshot.downloadProgress.totalOperations} operations</p>
                <div class="sync-status-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                    <div class="sync-status-progress-bar-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `);
    }

    if (snapshot.syncStreams?.length) {
        for (const stream of snapshot.syncStreams) {
            const progress = stream.progress;
            const label = stream.subscription?.name ?? 'Sync stream';
            if (progress) {
                const pct = Math.round(progress.downloadedFraction * 100);
                parts.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${escapeHtml(label)}</p>
                        <p class="sync-status-item-meta">${progress.downloadedOperations} / ${progress.totalOperations} (${pct}%)</p>
                    </article>
                `);
            } else {
                parts.push(`
                    <article class="sync-status-item">
                        <p class="sync-status-item-detail">${escapeHtml(label)}</p>
                        <p class="sync-status-item-meta">Idle</p>
                    </article>
                `);
            }
        }
    }

    if (!flow.downloading) {
        parts.push(`
            <article class="sync-status-item sync-status-item--summary">
                <p class="sync-status-item-detail">${snapshot.hasSynced ? 'Up to date' : 'Waiting for first sync'}</p>
                <p class="sync-status-item-meta">Last synced: ${formatDateTime(snapshot.lastSyncedAt)}</p>
                ${snapshot.bookingCount != null ? `<p class="sync-status-item-meta">${snapshot.bookingCount} booking(s) stored locally</p>` : ''}
            </article>
        `);
    }

    const activityLog = getDownloadActivityLog();
    if (activityLog.length > 0) {
        parts.push('<h3 class="sync-status-activity-heading">Recent download activity</h3>');
        for (const entry of activityLog) {
            parts.push(`
                <article class="sync-status-item">
                    <p class="sync-status-item-detail">${formatDateTime(entry.at)}</p>
                    <p class="sync-status-item-meta">${entry.operations != null ? `${entry.operations} operations received` : 'Download completed'}</p>
                </article>
            `);
        }
    }

    if (flow.uploading) {
        parts.unshift('<p class="sync-status-active-label">Uploading changes…</p>');
    }

    downloadsEl.innerHTML = parts.length ? parts.join('') : '<p class="sync-status-empty">No download activity</p>';
}

function renderIssues(snapshot) {
    const parts = [];
    const flow = snapshot.dataFlowStatus ?? {};

    if (flow.downloadError) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Download error</p>
                <p class="sync-status-issue-message">${escapeHtml(flow.downloadError.message ?? String(flow.downloadError))}</p>
            </article>
        `);
    }

    if (flow.uploadError) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--error">
                <p class="sync-status-issue-type">Upload error</p>
                <p class="sync-status-issue-message">${escapeHtml(flow.uploadError.message ?? String(flow.uploadError))}</p>
            </article>
        `);
    }

    if (snapshot.syncConfigured && !snapshot.hasRestaurant) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Restaurant not assigned</p>
                <p class="sync-status-issue-message">Your account has no restaurant_id. Sync cannot start until an admin assigns one.</p>
            </article>
        `);
    }

    if (!snapshot.syncConfigured) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Local-only mode</p>
                <p class="sync-status-issue-message">VITE_POWERSYNC_URL is not configured. Data stays in the browser only.</p>
            </article>
        `);
    }

    if (snapshot.uploadQueueCount > 0 && snapshot.online) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--warning">
                <p class="sync-status-issue-type">Pending uploads</p>
                <p class="sync-status-issue-message">${snapshot.uploadQueueCount} change(s) waiting to upload.</p>
            </article>
        `);
    }

    const issues = getRecentIssues();
    for (const issue of issues) {
        parts.push(`
            <article class="sync-status-issue sync-status-issue--${issue.type.includes('discarded') ? 'error' : 'warning'}">
                <p class="sync-status-issue-type">${escapeHtml(issue.type.replace(/_/g, ' '))}</p>
                <p class="sync-status-issue-message">${escapeHtml(issue.message)}</p>
                <p class="sync-status-issue-meta">${formatDateTime(issue.at)}</p>
            </article>
        `);
    }

    issuesEl.innerHTML = parts.length
        ? parts.join('')
        : '<p class="sync-status-empty">No issues detected</p>';
}

function render(snapshot) {
    renderSummary(snapshot);
    renderUploads(snapshot);
    renderDownloads(snapshot);
    renderIssues(snapshot);
}

subscribeSyncStatus(render);
