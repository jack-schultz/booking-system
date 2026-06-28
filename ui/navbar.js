/**
 * Renders the shared top navigation bar.
 * @param {HTMLElement} mountPoint - Element replaced by the navbar markup
 * @param {{ basePath?: string, showAuthControls?: boolean }} options
 *   basePath: '' for site root pages, '../' for booking/ pages
 *   showAuthControls: show account switcher trigger and logout link
 */
export function mountSiteNavbar(mountPoint, { basePath = '', showAuthControls = false } = {}) {
    const authControls = showAuthControls
        ? `<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`
        : '';

    mountPoint.outerHTML = `
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                <a href="${basePath}login.html">Login</a>
                <a href="${basePath}index.html">Home</a>
                <a href="${basePath}booking/manager.html">Bookings</a>
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${authControls}
                <a href="https://github.com/jack-schultz/booking-system">GitHub</a>
            </div>
        </div>
    `;

    mountOfflineIndicator();
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
