import '../pwa/register.js';
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

function getOrCreateTimeslotGroup(timeslot, datetime) {
    const groupId = `timeslot-group-${timeslot}`;
    let group = document.getElementById(groupId);

    if (!group) {
        group = document.createElement('section');
        group.id = groupId;
        group.className = 'booking-timeslot-group';

        const heading = document.createElement('div');
        heading.className = 'booking-timeslot-heading';
        heading.textContent = formatTimeslot(datetime);

        const items = document.createElement('div');
        items.className = 'booking-timeslot-items';

        group.append(heading, items);
        bookingList.appendChild(group);
    }

    return group.querySelector('.booking-timeslot-items');
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
        const timeslotItems = getOrCreateTimeslotGroup(timeslot, booking.datetime);

        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-list-item-card';
        bookingDiv.innerHTML = `
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${booking.first_name} ${booking.last_name}</span>
                    <div class="booking-detail-preference">${booking.preference.charAt(0).toUpperCase() + booking.preference.slice(1)}</div>
                </div>
                <span class="booking-summary-time">${formatTimeslot(booking.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${booking.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${booking.adult_pax}A</span>
                        <span>${booking.child_pax}C</span>
                        <span>${booking.hc_pax}HC</span>
                    </span>
                </span>
            </div>

            <div class="booking-list-item-details">
                <div class="booking-detail-grid">
                    <div class="booking-detail-contact">
                        ${booking.phone_number
                            ? `<a class="booking-detail-phone" href="tel:${booking.phone_number}">${booking.phone_number}</a>`
                            : '<span class="booking-detail-phone booking-detail-empty">—</span>'}
                        ${booking.email
                            ? `<a class="booking-detail-email" href="mailto:${booking.email}">${booking.email}</a>`
                            : '<span class="booking-detail-email booking-detail-empty">No Email</span>'}
                    </div>
                    
                    <div class="booking-detail-notes${booking.notes ? '' : ' is-empty'}">${booking.notes || 'No notes'}</div>
                </div>

                <div class="booking-actions-row">
                    <button class="booking-action-edit" data-id="${booking.id}">Edit</button>
                    <button class="booking-action-delete" data-id="${booking.id}">Delete</button>
                </div>
            </div>
        `;

        bookingDiv.addEventListener('click', () => {
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

        timeslotItems.appendChild(bookingDiv);
    });
}

await switcherPromise;
await loadBookings();
