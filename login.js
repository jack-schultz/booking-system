import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { getAccountDisplayName, getActiveAccount } from './auth/accounts.js';
import { initAccountSwitcher, registerLoggedInSession } from './auth/accountSwitcher.js';
import {mountPublicNavbar} from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountPublicNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');
const storedAccountPrompt = document.getElementById('stored-account-prompt');
const storedAccountName = document.getElementById('stored-account-name');
const storedAccountContinue = document.getElementById('stored-account-continue');

await initAccountSwitcher({ loginRedirect: 'login.html' });

const activeAccount = getActiveAccount();
if (activeAccount && storedAccountPrompt && storedAccountName && storedAccountContinue) {
    storedAccountName.textContent = getAccountDisplayName(activeAccount);
    storedAccountPrompt.hidden = false;
    storedAccountContinue.addEventListener('click', () => {
        window.location.href = 'booking/manager';
    });
}

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

    // DB init happens on booking pages — starting it here orphans the worker on redirect.
    window.location.href = 'booking/manager';
});
