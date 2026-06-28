import './pwa/register.js';
import { initAccountSwitcher } from './auth/accountSwitcher.js';
import { mountSiteNavbar } from './ui/navbar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), { showAuthControls: true });

initAccountSwitcher({ loginRedirect: 'login.html' });
