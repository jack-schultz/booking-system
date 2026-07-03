import './pwa/register.js';
import { supabase } from './supabaseClient.js';
import { mountSiteNavbar } from './ui/navbar.js';
import { mountSiteFooter } from './ui/footer.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'));
mountSiteFooter(document.getElementById('site-footer-mount'));

const form = document.getElementById('signupForm');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageEl.textContent = '';
    messageEl.className = '';

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
        messageEl.className = 'auth-message auth-message--error';
        return;
    }

    if (data.session) {
        messageEl.textContent = 'Account created. You can log in now.';
        messageEl.className = 'auth-message auth-message--success';
        return;
    }

    messageEl.textContent =
        'Account created. Check your email to verify your address, then log in.';
    messageEl.className = 'auth-message auth-message--success';
});
