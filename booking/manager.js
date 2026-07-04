import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import {
    deleteBooking,
    formatTimeslot,
    getTimeslotFromDatetime,
    getNextBookingStatus,
    getBookingStatusClass,
    getBookingStatusLabel,
    toTimestamptz,
    updateBookingStatus,
} from '../db/bookings.js';
import {
    initAccountSwitcher,
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../auth/accountSwitcher.js';
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
const bookingNotice = document.getElementById('booking-notice');

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => subscribeBookings(),
});

const db = await initDatabase();

function getTodayDateWithOffset(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getDateRange(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

let dateOffset = 0;
let activeWatch = null;

document.getElementById('booking-list-date-left').addEventListener('click', () => {
    dateOffset -= 1;
    subscribeBookings();
});
document.getElementById('booking-list-date-right').addEventListener('click', () => {
    dateOffset += 1;
    subscribeBookings();
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

async function advanceBookingStatus(bookingId, status) {
    const nextStatus = getNextBookingStatus(status);
    await updateBookingStatus(db, bookingId, getActiveRestaurantId(), nextStatus);
}

function renderBookings(bookings, date) {
    const header = document.getElementById('booking-list-header');
    header.textContent = date.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
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

        const statusClass = getBookingStatusClass(booking.status);
        const statusLabel = getBookingStatusLabel(booking.status);
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
                booking.status
            );
        });

        bookingDiv.querySelector('.booking-action-delete').addEventListener('click', async (event) => {
            event.stopPropagation();
            if (confirm('Are you sure you want to delete this booking?')) {
                await deleteBooking(db, booking.id, getActiveRestaurantId());
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

function showUnassignedNotice() {
    bookingNotice.hidden = false;
    bookingNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    bookingList.innerHTML = '';
    document.getElementById('booking-list-header').textContent = 'Bookings unavailable';
}

async function subscribeBookings() {
    // Tear down the old watcher when date or account changes — otherwise we leak listeners and render twice.
    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    bookingNotice.hidden = true;

    const date = getTodayDateWithOffset(dateOffset);
    const { start, end } = getDateRange(date);
    const restaurantId = getActiveRestaurantId();

    activeWatch = db
        .query({
            sql: `SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime, last_name`,
            parameters: [restaurantId, toTimestamptz(start), toTimestamptz(end)],
        })
        .watch();

    // query().watch() uses onData (not onResult) — fires whenever local SQLite or sync updates the query.
    activeWatch.registerListener({
        onData: (bookings) => renderBookings(bookings, date),
    });
}

await switcherPromise;
await subscribeBookings();
void ensureSyncConnected(db);
