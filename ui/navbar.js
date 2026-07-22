/**
 * Navigation bar variants for public pages, auth pages, and the booking SPA.
 */
import { getSyncIndicatorMarkup, initSyncIndicator, wireSyncIndicatorNavigation } from './syncIndicator.js';

const APP_NAV_ROUTES = [
    { name: 'manager', label: 'Bookings' },
    { name: 'metrics', label: 'Weekly Metrics' },
    { name: 'tables', label: 'Tables' },
];

function authControlsMarkup() {
    return `<a id="logged_in_user">Not Logged In</a>
            <a id="logoutBtn">Logout</a>`;
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

/**
 * Public pages (index, signup): single entry point into the app.
 * @param {HTMLElement} mountPoint
 * @param {{ basePath?: string }} options
 */
export function mountPublicNavbar(mountPoint, { basePath = '' } = {}) {
    mountPoint.outerHTML = `
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                <a href="${basePath}booking/manager">Open Booking App</a>
            </div>
        </div>
    `;
}

/**
 * Booking SPA: app section links, sync indicator, and auth controls.
 * @param {HTMLElement} mountPoint
 * @param {{ basePath?: string, activeRoute?: string, onNavigate?: Function }} options
 */
export function mountAppNavbar(
    mountPoint,
    { basePath = '../', activeRoute, onNavigate } = {}
) {
    const syncIndicator = getSyncIndicatorMarkup(basePath, { route: 'sync-status' });

    const primaryLinks = APP_NAV_ROUTES.map(({ name, label }) => {
        const isActive = activeRoute === name;
        return `<a href="${basePath}booking/${name === 'manager' ? 'manager' : name}" class="site-navbar-app-link${isActive ? ' is-active' : ''}" data-route="${name}"${isActive ? ' aria-current="page"' : ''}>${label}</a>`;
    }).join('');

    mountPoint.outerHTML = `
        <div class="site-navbar">
            <div class="site-navbar-links-primary">
                ${primaryLinks}
            </div>
            <div class="site-navbar-links-user">
                <span id="offline-indicator" class="offline-indicator" hidden>Offline</span>
                ${syncIndicator}
                ${authControlsMarkup()}
            </div>
        </div>
    `;

    mountOfflineIndicator();
    initSyncIndicator();
    wireAppNavbarNavigation(onNavigate);
}

/**
 * @param {{ activeRoute?: string, onNavigate?: Function, basePath?: string }} options
 */
export function updateAppNavbar({ activeRoute, onNavigate, basePath = '../' } = {}) {
    const navbar = document.querySelector('.site-navbar');
    if (!navbar) return;

    navbar.querySelectorAll('.site-navbar-app-link[data-route]').forEach((link) => {
        const route = link.getAttribute('data-route');
        const isActive = route === activeRoute;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    wireAppNavbarNavigation(onNavigate);
    wireSyncIndicatorNavigation(onNavigate);
}

function wireAppNavbarNavigation(onNavigate) {
    document.querySelectorAll('.site-navbar-app-link[data-route]').forEach((link) => {
        if (link.dataset.navWired === 'true') return;
        link.dataset.navWired = 'true';

        link.addEventListener('click', (event) => {
            const route = link.getAttribute('data-route');
            if (!route || !onNavigate) return;
            event.preventDefault();
            onNavigate(route);
        });
    });

    wireSyncIndicatorNavigation(onNavigate);
}
