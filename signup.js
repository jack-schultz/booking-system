import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { enhancePasswordField } from './ui/passwordInput.js';
import { wireLandingThemeToggles } from './ui/landingTheme.js';

wireLandingThemeToggles();

const form = document.getElementById('signupForm');
const messageEl = document.getElementById('message');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const MESSAGE_BASE = 'mt-4 text-center text-sm';
const MESSAGE_ERROR = `${MESSAGE_BASE} text-error`;

enhancePasswordField(passwordInput);
enhancePasswordField(confirmPasswordInput);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    messageEl.className = MESSAGE_BASE;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        messageEl.textContent = 'Passwords do not match.';
        messageEl.className = MESSAGE_ERROR;
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        },
    });

    if (error) {
        messageEl.textContent = error.message;
        messageEl.className = MESSAGE_ERROR;
        return;
    }

    if (data.session) {
        await registerLoggedInSession(supabase, data.session);
        window.location.href = 'booking/manager';
        return;
    }

    window.location.href = `confirm-email.html?email=${encodeURIComponent(email)}`;
});
