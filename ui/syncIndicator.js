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

/**
 * @param {{ basePath?: string }} options
 */
export function initSyncIndicator({ basePath = '' } = {}) {
    const link = document.getElementById('sync-indicator');
    if (!link) {
        return;
    }

    function applyHealth(health) {
        link.classList.remove('sync-indicator--offline', 'sync-indicator--warning', 'sync-indicator--ok');
        link.classList.add(`sync-indicator--${health}`);
        link.setAttribute('aria-label', HEALTH_LABELS[health] ?? 'Sync status');
    }

    subscribeSyncStatus((snapshot) => {
        applyHealth(snapshot.health);
    });
}

export function getSyncIndicatorMarkup(basePath) {
    return `<a id="sync-indicator" class="sync-indicator sync-indicator--ok" href="${basePath}sync-status.html" aria-label="${HEALTH_LABELS.ok}">${SYNC_ICON_SVG}</a>`;
}
