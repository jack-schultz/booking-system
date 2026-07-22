import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import { initAccountSwitcher } from '../auth/accountSwitcher.js';
import { mountAppNavbar, updateAppNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';
import { mountBookingSidebar, updateBookingSidebar } from '../ui/bookingSidebar.js';

/** @type {Set<(account: import('../auth/accounts.js').Account | null) => void>} */
const accountSwitchListeners = new Set();

const SIDEBAR_ROUTES = new Set(['manager', 'create', 'walkin']);

function notifyAccountSwitch(account) {
    for (const listener of accountSwitchListeners) {
        listener(account);
    }
}

function setSidebarVisible(route) {
    const layout = document.getElementById('booking-shell-layout');
    const panel = document.getElementById('booking-sidebar-panel');
    const showSidebar = SIDEBAR_ROUTES.has(route);
    layout?.classList.toggle('booking-page-layout--no-sidebar', !showSidebar);
    if (panel) {
        panel.hidden = !showSidebar;
    }
}

/**
 * One-time startup for the booking SPA shell.
 * @param {{ initialRoute: string, onNavigate: (route: string, options?: { edit?: string }) => void }} options
 */
export async function bootstrapBookingApp({ initialRoute, onNavigate }) {
    mountAppNavbar(document.getElementById('site-navbar-mount'), {
        basePath: '../',
        activeRoute: initialRoute,
        onNavigate,
    });
    mountSiteFooter(document.getElementById('site-footer-mount'), {
        basePath: '../',
    });
    mountBookingSidebar(document.getElementById('booking-sidebar-mount'), {
        activeRoute: initialRoute,
        onNavigate,
        showSaveButton: initialRoute === 'create',
    });
    setSidebarVisible(initialRoute);

    const switcherPromise = initAccountSwitcher({
        requireAuth: true,
        loginRedirect: '../login.html',
        onSwitch: (account) => notifyAccountSwitch(account),
    });

    const db = await initDatabase();
    await switcherPromise;
    void ensureSyncConnected(db);

    return {
        db,
        registerOnAccountSwitch(fn) {
            accountSwitchListeners.add(fn);
            return () => accountSwitchListeners.delete(fn);
        },
        setActiveRoute(route) {
            setSidebarVisible(route);
            updateAppNavbar({
                activeRoute: route,
                onNavigate,
                basePath: '../',
            });
            if (SIDEBAR_ROUTES.has(route)) {
                updateBookingSidebar({
                    activeRoute: route,
                    onNavigate,
                    showSaveButton: route === 'create',
                });
            }
        },
    };
}
