import '../pwa/register.js';
import { initAccountSwitcher } from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountBookingSidebar } from '../ui/bookingSidebar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'));

initAccountSwitcher({ requireAuth: true, loginRedirect: '../login.html' });
