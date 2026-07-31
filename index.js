import { supabase } from './supabaseClient.js';
import { wireDemoModeButton } from './auth/demoMode.js';
import { wireLandingThemeToggles } from './ui/landingTheme.js';

const demoErrorEl = document.getElementById('demo-error');

wireLandingThemeToggles();
document.querySelectorAll('.demo-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        demoErrorEl.textContent = '';
    });
});
wireDemoModeButton(supabase, {
    onError: (err) => {
        demoErrorEl.textContent = err.message;
        demoErrorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
});
