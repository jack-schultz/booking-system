import './pwa/register.js';
import { mountPublicNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountPublicNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));
