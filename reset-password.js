import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { mountPublicNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';
import { enhancePasswordField } from './ui/passwordInput.js';

mountPublicNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

const form = document.getElementById('resetPasswordForm');
const messageEl = document.getElementById('message');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

enhancePasswordField(passwordInput);
enhancePasswordField(confirmPasswordInput);

let recoveryReady = false;

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `auth-message auth-message--${type}`;
}

function showRecoveryForm() {
    if (recoveryReady) return;
    recoveryReady = true;
    form.hidden = false;
    showMessage('Enter a new password for your account.', 'success');
}

supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
        showRecoveryForm();
    }
});

const { data, error } = await supabase.auth.getSession();

if (error) {
    showMessage(error.message, 'error');
} else if (data.session) {
    showRecoveryForm();
} else if (window.location.hash) {
    showMessage(
        'This reset link is invalid or has expired. Request a new one from the login page.',
        'error'
    );
} else {
    showMessage(
        'Open the reset link from your email, or request a new one from the login page.',
        'error'
    );
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!recoveryReady) {
        showMessage('This reset link is invalid or has expired. Request a new one.', 'error');
        return;
    }

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'error');
        return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        showMessage(error.message, 'error');
        return;
    }

    showMessage('Password updated. You can log in with your new password.', 'success');
    form.hidden = true;

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});
