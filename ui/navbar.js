/**
 * Renders the shared top navigation bar.
 * @param {HTMLElement} mountPoint - Element replaced by the navbar markup
 * @param {{ basePath?: string, showAuthControls?: boolean, showSyncIndicator?: boolean }} options
 *   basePath: '' for site root pages, '../' for booking/ pages
 *   showAuthControls: show account switcher trigger and logout link
 *   showSyncIndicator: show sync status icon linking to sync-status.html
 */
import { getSyncIndicatorMarkup, initSyncIndicator } from './syncIndicator.js';

export function mountSiteNavbar(
    mountPoint,
    { basePath = '', showAuthControls = false, showSyncIndicator = false } = {}
) {
    const authControls = showAuthControls
        ? `<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`
        : '';

    const syncIndicator = showSyncIndicator ? getSyncIndicatorMarkup(basePath) : '';

    mountPoint.outerHTML = `
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
            <a href="${basePath}index.html">Home</a>
                <a href="${basePath}booking/manager.html">Booking Manager</a>
                <a href="${basePath}booking/metrics.html">Weekly Metrics</a>
                <a href="${basePath}booking/tables.html">Tables</a>
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${syncIndicator}
                ${authControls}
            </div>
        </div>
    `;

    mountOfflineIndicator();
    if (showSyncIndicator) {
        initSyncIndicator({ basePath });
    }
}

function mountOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (!indicator) return;

    function update() {
        indicator.hidden = navigator.onLine;
    }

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
}
