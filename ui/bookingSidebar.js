/**
 * Renders the booking section sidebar navigation.
 * @param {HTMLElement} mountPoint
 * @param {{ showSaveButton?: boolean }} options
 */
export function mountBookingSidebar(mountPoint, { showSaveButton = false } = {}) {
    const saveButton = showSaveButton
        ? `<button type="submit" form="bookingForm" class="booking-sidebar-nav-link booking-sidebar-nav-link--save">SAVE BOOKING</button>`
        : '';

    mountPoint.outerHTML = `
        <nav class="booking-sidebar-nav">
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--bookings" href="manager.html">BOOKINGS</a>
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--new-booking" href="create.html">NEW BOOKING</a>
            <a class="booking-sidebar-nav-link booking-sidebar-nav-link--walk-in" href="walkin-create.html">WALK-IN</a>
            ${saveButton}
        </nav>
    `;
}
