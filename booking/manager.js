import { initDatabase } from '../db/index.js';
import {
    deleteBooking,
    formatTimeslot,
    getBookingsForDate,
    getTimeslotFromDatetime,
} from '../db/bookings.js';
import { initAccountSwitcher, getActiveRestaurantId } from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountBookingSidebar } from '../ui/bookingSidebar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'));

const bookingList = document.getElementById('booking-list');
const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => loadBookings(),
});
const db = await initDatabase();

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

async function loadBookings() {
    const bookings = await getBookingsForDate(db, getTodayDate(), getActiveRestaurantId());

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings for today</p>';
        return;
    }

    bookingList.innerHTML = '';

    bookings.forEach((booking) => {
        const timeslot = getTimeslotFromDatetime(booking.datetime);

        if (!document.getElementById(timeslot)) {
            const timeslotDiv = document.createElement('div');
            timeslotDiv.textContent = formatTimeslot(booking.datetime);
            timeslotDiv.id = timeslot;
            timeslotDiv.className = 'booking-timeslot-heading';
            bookingList.appendChild(timeslotDiv);
        }

        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-list-item-card';
        bookingDiv.innerHTML = `
            <div class="booking-list-item-summary">
                <strong>${booking.first_name} ${booking.last_name}</strong> for
                <strong>${booking.total_pax}</strong> PAX (${booking.adult_pax}, ${booking.child_pax}, ${booking.hc_pax})
                Preference: <strong>${booking.preference}</strong>
            </div>

            <div class="booking-list-item-details">
                <p><strong>Total Pax</strong>: <strong>${booking.total_pax}</strong> (<strong>${booking.adult_pax}</strong> Adults, <strong>${booking.child_pax}</strong> Children, <strong>${booking.hc_pax}</strong> HC)</p>
                <p><strong>Time</strong>: ${formatTimeslot(booking.datetime)}</p>
                <p><strong>Phone</strong>: ${booking.phone_number ?? '-'}</p>
                <p><strong>Email</strong>: ${booking.email || '-'}</p>
                <p><strong>Preference</strong>: ${booking.preference}</p>
                <p><strong>Notes</strong>: ${booking.notes || '-'}</p>

                <div class="booking-actions-row">
                    <button class="booking-action-edit" data-id="${booking.id}">Edit</button>
                    <button class="booking-action-delete" data-id="${booking.id}">Delete</button>
                </div>
            </div>
        `;

        bookingDiv.querySelector('.booking-list-item-summary').addEventListener('click', () => {
            bookingDiv.querySelector('.booking-list-item-details').classList.toggle('is-expanded');
        });

        bookingDiv.querySelector('.booking-action-delete').addEventListener('click', async (event) => {
            event.stopPropagation();
            if (confirm('Are you sure you want to delete this booking?')) {
                await deleteBooking(db, booking.id, getActiveRestaurantId());
                await loadBookings();
            }
        });

        bookingDiv.querySelector('.booking-action-edit').addEventListener('click', (event) => {
            event.stopPropagation();
            const id = event.target.getAttribute('data-id');
            window.location.href = `create.html?edit=${id}`;
        });

        bookingList.appendChild(bookingDiv);
    });
}

await switcherPromise;
await loadBookings();
