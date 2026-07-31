import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { wireDemoModeButton } from './auth/demoMode.js';

wireDemoModeButton(supabase, {
    onError: (err) => {
        messageEl.textContent = err.message;
        messageEl.className = MESSAGE_ERROR;
    },
});

const form = document.getElementById('signupForm');
const messageEl = document.getElementById('message');

const MESSAGE_BASE = 'mt-4 text-center text-sm';
const MESSAGE_ERROR = `${MESSAGE_BASE} text-error`;
const MESSAGE_SUCCESS = `${MESSAGE_BASE} text-success`;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    messageEl.className = MESSAGE_BASE;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
        messageEl.textContent = 'Account created. You can log in now.';
        messageEl.className = MESSAGE_SUCCESS;
        return;
    }

    messageEl.textContent =
        'Account created. Check your email to verify your address, then log in.';
    messageEl.className = MESSAGE_SUCCESS;
});
