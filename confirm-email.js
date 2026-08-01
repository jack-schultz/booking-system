import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { wireLandingThemeToggles } from './ui/landingTheme.js';

wireLandingThemeToggles();

const MESSAGE_BASE = 'text-sm';
const MESSAGE_ERROR = `${MESSAGE_BASE} text-error`;
const MESSAGE_SUCCESS = `${MESSAGE_BASE} text-success`;

const params = new URLSearchParams(window.location.search);
const email = params.get('email')?.trim() ?? '';

const emailDisplayEl = document.getElementById('emailDisplay');
const resendButton = document.getElementById('resendButton');
const messageEl = document.getElementById('message');

if (!email) {
    window.location.replace('signup.html');
} else {
    emailDisplayEl.textContent = email;
}

resendButton.addEventListener('click', async () => {
    messageEl.textContent = '';
    messageEl.className = MESSAGE_BASE;
    resendButton.disabled = true;

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
            emailRedirectTo: getEmailConfirmRedirectUrl(),
        },
    });

    resendButton.disabled = false;

    if (error) {
        messageEl.textContent = error.message;
        messageEl.className = MESSAGE_ERROR;
        return;
    }

    messageEl.textContent = 'Confirmation email sent. Check your inbox.';
    messageEl.className = MESSAGE_SUCCESS;
});
