import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { initDatabase } from './db/index.js';
import { registerLoggedInSession } from './auth/accountSwitcher.js';
import { mountSiteNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');
const dbPromise = initDatabase();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        errorEl.textContent = error.message;
        return;
    }

    await registerLoggedInSession(supabase, data.session);
    await dbPromise;
    window.location.href = 'booking/manager.html';
});
