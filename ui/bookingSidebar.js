const ROUTES = [
    { name: 'manager', label: 'BOOKINGS', className: 'booking-sidebar-nav-link--bookings' },
    { name: 'create', label: 'NEW BOOKING', className: 'booking-sidebar-nav-link--new-booking' },
    { name: 'walkin', label: 'WALK-IN', className: 'booking-sidebar-nav-link--walk-in' },
];

/**
 * @param {HTMLElement | null} nav
 * @param {{ activeRoute?: string, onNavigate?: Function, showSaveButton?: boolean }} options
 */
function renderSidebarNav(nav, { activeRoute, onNavigate, showSaveButton = false } = {}) {
    if (!nav) return;

    const saveButton = showSaveButton
        ? `<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`
        : '';

    nav.innerHTML = ROUTES.map(({ name, label, className }) => {
        const isActive = activeRoute === name;
        return `<button type="button" class="booking-sidebar-nav-link ${className}${isActive ? ' is-active' : ''}" data-route="${name}"${isActive ? ' aria-current="page"' : ''}>${label}</button>`;
    }).join('') + saveButton;

    nav.querySelectorAll('[data-route]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const route = btn.getAttribute('data-route');
            if (route && route !== activeRoute) {
                onNavigate?.(route);
            }
        });
    });
}

/**
 * Renders the booking section sidebar navigation.
 * @param {HTMLElement} mountPoint
 * @param {{ activeRoute?: string, onNavigate?: Function, showSaveButton?: boolean }} options
 */
export function mountBookingSidebar(mountPoint, options = {}) {
    const nav = document.createElement('nav');
    nav.className = 'booking-sidebar-nav';
    mountPoint.replaceWith(nav);
    renderSidebarNav(nav, options);
}

/**
 * Updates sidebar active state and save button visibility.
 * @param {{ activeRoute?: string, onNavigate?: Function, showSaveButton?: boolean }} options
 */
export function updateBookingSidebar(options = {}) {
    const nav = document.querySelector('.booking-sidebar-nav');
    renderSidebarNav(nav, options);
}
