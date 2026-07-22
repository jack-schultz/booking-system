import { subscribeSyncStatus } from '../db/syncStatus.js';

const SYNC_ICON_SVG = `
<span class="sync-indicator-graphic" aria-hidden="true">
    <span class="sync-indicator-core"></span>
    <svg class="sync-indicator-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g class="sync-indicator-outer" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
        </g>
    </svg>
</span>`;

const HEALTH_LABELS = {
    offline: 'Offline — sync unavailable',
    warning: 'Sync in progress or needs attention',
    ok: 'Sync up to date',
};

/** @type {(() => void) | null} */
let unsubscribeSyncIndicator = null;

export function initSyncIndicator() {
    const link = document.getElementById('sync-indicator');
    if (!link) {
        return;
    }

    unsubscribeSyncIndicator?.();

    function applyHealth(health) {
        link.classList.remove('sync-indicator--offline', 'sync-indicator--warning', 'sync-indicator--ok');
        link.classList.add(`sync-indicator--${health}`);
        link.setAttribute('aria-label', HEALTH_LABELS[health] ?? 'Sync status');
    }

    unsubscribeSyncIndicator = subscribeSyncStatus((snapshot) => {
        applyHealth(snapshot.health);
    });
}

/**
 * @param {Function | undefined} onNavigate
 */
export function wireSyncIndicatorNavigation(onNavigate) {
    const link = document.getElementById('sync-indicator');
    if (!link || !onNavigate) return;

    if (link.dataset.navWired === 'true') return;
    link.dataset.navWired = 'true';

    link.addEventListener('click', (event) => {
        event.preventDefault();
        onNavigate('sync-status');
    });
}

/**
 * @param {string} basePath
 * @param {{ route?: string, href?: string }} [options]
 */
export function getSyncIndicatorMarkup(basePath, { route = 'sync-status', href } = {}) {
    const targetHref = href ?? `${basePath}booking/${route}`;
    return `<a id="sync-indicator" class="sync-indicator sync-indicator--ok" href="${targetHref}" data-route="${route}" aria-label="${HEALTH_LABELS.ok}">${SYNC_ICON_SVG}</a>`;
}
