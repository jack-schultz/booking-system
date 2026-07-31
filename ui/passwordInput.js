/**
 * Wraps a password input with a show/hide toggle button.
 * @param {HTMLInputElement} input
 */
export function enhancePasswordField(input) {
    if (!input || input.dataset.passwordEnhanced === 'true') return;

    input.dataset.passwordEnhanced = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'password-field';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'password-field-toggle';
    toggle.setAttribute('aria-label', 'Show password');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.textContent = 'Show';
    wrapper.appendChild(toggle);

    toggle.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        toggle.textContent = isHidden ? 'Hide' : 'Show';
        toggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        toggle.setAttribute('aria-pressed', String(isHidden));
    });
}
