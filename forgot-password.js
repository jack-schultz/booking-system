import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { mountPublicNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountPublicNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

const form = document.getElementById('forgotPasswordForm');
const messageEl = document.getElementById('message');

function getPasswordResetRedirectUrl() {
    return new URL('reset-password.html', window.location.href).href;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    messageEl.className = '';

    const email = document.getElementById('email').value.trim();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getPasswordResetRedirectUrl(),
    });

    if (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'auth-message auth-message--error';
        return;
    }

    messageEl.textContent =
        'If an account exists for that email, a reset link has been sent. Check your inbox.';
    messageEl.className = 'auth-message auth-message--success';
});
