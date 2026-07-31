const STORAGE_KEY = 'landing-theme';

export function getLandingTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function updateToggleButtons() {
    const isLight = getLandingTheme() === 'light';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        button.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
        button.setAttribute('aria-pressed', String(isLight));
    });
}

export function setLandingTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';

    if (next === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}

    updateToggleButtons();
}

export function toggleLandingTheme() {
    setLandingTheme(getLandingTheme() === 'light' ? 'dark' : 'light');
}

export function wireLandingThemeToggles() {
    updateToggleButtons();

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
        if (button.dataset.themeToggleWired === 'true') return;

        button.dataset.themeToggleWired = 'true';
        button.addEventListener('click', toggleLandingTheme);
    });
}
