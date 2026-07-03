import '../pwa/register.js';
import { initDatabase } from '../db/index.js';
import {
    deleteBooking,
    formatTimeslot,
    getBookingsForDate,
    getTimeslotFromDatetime,
    getNextBookingStatus,
    getBookingStatusClass,
    getBookingStatusLabel,
    updateBookingStatus,
} from '../db/bookings.js';
import { initAccountSwitcher, getActiveRestaurantId } from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';
import { mountBookingSidebar } from '../ui/bookingSidebar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'));

const bookingList = document.getElementById('booking-list');
const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => loadBookings(),
});
const db = await initDatabase();

function getTodayDateWithOffset(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
}

let dateOffset = 0
document.getElementById("booking-list-date-left").addEventListener("click", () => {
    dateOffset -= 1
    loadBookings();
});
document.getElementById("booking-list-date-right").addEventListener("click", () => {
    dateOffset += 1
    loadBookings();
});

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

async function advanceBookingStatus(bookingId, status, tableSet) {
    const nextStatus = getNextBookingStatus(status, tableSet);
    await updateBookingStatus(db, bookingId, getActiveRestaurantId(), nextStatus);
    await loadBookings();
}

async function loadBookings() {
    const date = getTodayDateWithOffset(dateOffset);
    const bookings = await getBookingsForDate(db, date, getActiveRestaurantId());

    const header = document.getElementById("booking-list-header");
    header.textContent = date.toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings for today</p>';
        return;
    }

    bookingList.innerHTML = '';

    bookings.forEach((booking) => {
        const timeslot = getTimeslotFromDatetime(booking.datetime);
        const timeslotItems = getOrCreateTimeslotGroup(timeslot, booking.datetime);

        let preference = '';
        if (booking.preference !== 'none') {
            preference = `<div class="booking-detail-preference">${booking.preference.charAt(0).toUpperCase() + booking.preference.slice(1)}</div>`;
        }

        const statusClass = getBookingStatusClass(booking.status, booking.table_set);
        const statusLabel = getBookingStatusLabel(booking.status, booking.table_set);
        const status = `<button type="button" class="booking-detail-status ${statusClass}" data-id="${booking.id}">${statusLabel}</button>`;

        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-list-item-card';
        bookingDiv.innerHTML = `
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${booking.first_name} ${booking.last_name}</span>
                    ${preference}
                </div>
                <span class="booking-summary-time">${formatTimeslot(booking.datetime)}</span>
                <span class="booking-summary-pax">
                    <span class="booking-summary-pax-total">${booking.total_pax}</span>
                    <span class="booking-summary-pax-breakdown">
                        <span>${booking.adult_pax}A</span>
                        <span>${booking.child_pax}C</span>
                        <span>${booking.hc_pax}HC</span>
                    </span>
                    ${status}
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

        bookingDiv.querySelector('.booking-detail-status').addEventListener('click', async (event) => {
            event.stopPropagation();
            await advanceBookingStatus(
                event.currentTarget.getAttribute('data-id'),
                booking.status,
                booking.table_set
            );
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
