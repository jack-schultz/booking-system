import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import { initAccountSwitcher } from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';
import { mountBookingSidebar, updateBookingSidebar } from '../ui/bookingSidebar.js';

/** @type {Set<(account: import('../auth/accounts.js').Account | null) => void>} */
const accountSwitchListeners = new Set();

function notifyAccountSwitch(account) {
    for (const listener of accountSwitchListeners) {
        listener(account);
    }
}

/**
 * One-time startup for the booking SPA shell.
 * @param {{ initialRoute: string, onNavigate: (route: string, options?: { edit?: string }) => void }} options
 */
export async function bootstrapBookingApp({ initialRoute, onNavigate }) {
    mountSiteNavbar(document.getElementById('site-navbar-mount'), {
        basePath: '../',
        showAuthControls: true,
        showSyncIndicator: true,
    });
    mountSiteFooter(document.getElementById('site-footer-mount'), {
        basePath: '../',
    });
    mountBookingSidebar(document.getElementById('booking-sidebar-mount'), {
        activeRoute: initialRoute,
        onNavigate,
        showSaveButton: initialRoute === 'create',
    });

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
            updateBookingSidebar({
                activeRoute: route,
                onNavigate,
                showSaveButton: route === 'create',
            });
        },
    };
}
