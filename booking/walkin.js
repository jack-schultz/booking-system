import '../pwa/register.js';
import { initAccountSwitcher } from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';
import { mountBookingSidebar } from '../ui/bookingSidebar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
    showSyncIndicator: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'));

initAccountSwitcher({ requireAuth: true, loginRedirect: '../login.html' });
