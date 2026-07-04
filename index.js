import './pwa/register.js';
import { initAccountSwitcher } from './auth/accountSwitcher.js';
import { mountSiteNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

initAccountSwitcher({ loginRedirect: 'login.html' });
