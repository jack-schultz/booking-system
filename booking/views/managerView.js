import {
    aggregateBookingsByDay,
    createEmptyPaxTotals,
    addPaxTotals,
    deleteBooking,
    formatTimeslot,
    getTimeslotFromDatetime,
    getNextBookingStatus,
    getBookingStatusClass,
    getBookingStatusLabel,
    toTimestamptz,
    updateBookingStatus,
} from '../../db/bookings.js';
import {
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';
import { formatPaxBreakdown, formatPaxSummary } from '../../ui/paxSummary.js';
import {
    getDateRange,
    mountBookingDateBar,
} from '../../ui/bookingDateBar.js';

/** @type {AbortController | null} */
let abortController = null;
/** @type {import('@powersync/web').SyncStreamSubscription | null} */
let activeWatch = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
/** @type {ReturnType<typeof mountBookingDateBar> | null} */
let dateBar = null;
let db = null;
let onNavigate = null;

// Required as the date bar is used in multiple views
const MANAGER_DATE_BAR_IDS = {
    dateLeft: 'booking-list-date-left',
    dateRight: 'booking-list-date-right',
    datePicker: 'booking-date-picker',
    dateHeader: 'booking-list-header',
    headerPax: 'booking-header-pax',
    dateDropdown: 'booking-date-dropdown',
    dateDropdownList: 'booking-date-dropdown-list',
    dateToday: 'booking-date-today',
};

const root = () => document.getElementById('view-manager');

function getTimeslotPaxTotals(bookings) {
    const totals = new Map();

    for (const booking of bookings) {
        const timeslot = getTimeslotFromDatetime(booking.datetime);
        const current = totals.get(timeslot) ?? createEmptyPaxTotals();
        addPaxTotals(current, booking);
        totals.set(timeslot, current);
    }

    return totals;
}

function getOrCreateTimeslotGroup(timeslot, datetime, paxTotals, bookingList) {
    const groupId = `timeslot-group-${timeslot}`;
    let group = document.getElementById(groupId);

    if (!group) {
        group = document.createElement('section');
        group.id = groupId;
        group.className = 'booking-timeslot-group';

        const heading = document.createElement('div');
        heading.className = 'booking-timeslot-heading';

        heading.innerHTML = `
        <div class="booking-summary-primary">
            <span class="booking-timeslot-time">${formatTimeslot(datetime)}</span>
            <span class="booking-summary-pax">${formatPaxBreakdown(paxTotals)}</span>
        </div>`;

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

function renderBookings(bookings) {
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingList = viewRoot.querySelector('#booking-list');

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings for today. (or they are still downloading)</p>';
        return;
    }

    bookingList.innerHTML = '';

    const timeslotPaxTotals = getTimeslotPaxTotals(bookings);

    bookings.forEach((booking) => {
        const timeslot = getTimeslotFromDatetime(booking.datetime);
        const timeslotItems = getOrCreateTimeslotGroup(
            timeslot,
            booking.datetime,
            timeslotPaxTotals.get(timeslot),
            bookingList,
        );

        let preference = '';
        if (booking.preference !== 'none') {
            preference = `<div class="booking-detail-preference">${booking.preference.charAt(0).toUpperCase() + booking.preference.slice(1)}</div>`;
        }

        const tableBadge = booking.table_name
            ? `<div class="booking-summary-table">${booking.table_name}</div>`
            : '<div class="booking-summary-table is-unassigned">No table</div>';

        const statusClass = getBookingStatusClass(booking.status);
        const statusLabel = getBookingStatusLabel(booking.status);
        const status = `<button type="button" class="booking-detail-status ${statusClass}" data-id="${booking.id}">${statusLabel}</button>`;

        const bookingDiv = document.createElement('div');
        bookingDiv.className = 'booking-list-item-card';
        bookingDiv.innerHTML = `
            <div class="booking-summary-primary">
                <div class="booking-detail-time-preference">
                    <span class="booking-summary-name">${booking.first_name} ${booking.last_name}</span>
                    ${tableBadge}                    
                    ${preference}
                </div>
                <span class="booking-summary-time">${formatTimeslot(booking.datetime)}</span>
                <span class="booking-summary-pax">
                    ${formatPaxBreakdown(booking)}
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
            onNavigate?.('create', { edit: id });
        });

        timeslotItems.appendChild(bookingDiv);
    });

    const { dayTotal, lunch, dinner } = aggregateBookingsByDay(bookings);
    const section = document.createElement('section');
    section.className = 'booking-timeslot-group booking-day-total';
    section.innerHTML = `
        <div class="booking-timeslot-heading">
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Lunch Total Pax</span>
                ${formatPaxSummary(lunch)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Dinner Total Pax</span>
                ${formatPaxSummary(dinner)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Pax</span>
                ${formatPaxSummary(dayTotal)}
            </div>
            <div class="booking-summary-primary">
                <span class="booking-timeslot-time">Total Bookings</span>
                ${bookings.length}
            </div>
        </div>
    `;
    bookingList.appendChild(section);
}

function showUnassignedNotice() {
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingNotice = viewRoot.querySelector('#booking-notice');
    const bookingList = viewRoot.querySelector('#booking-list');
    bookingNotice.hidden = false;
    bookingNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    bookingList.innerHTML = '';
    dateBar?.setHeaderUnavailable();
}

async function subscribeBookings() {
    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    const viewRoot = root();
    if (!viewRoot || !dateBar) return;

    dateBar.refresh();

    const bookingNotice = viewRoot.querySelector('#booking-notice');
    bookingNotice.hidden = true;

    const date = dateBar.getDate();
    const { start, end } = getDateRange(date);
    const restaurantId = getActiveRestaurantId();

    activeWatch = db
        .query({
            sql: `SELECT b.*, t.name AS table_name
                  FROM bookings b
                  LEFT JOIN tables t ON t.id = b.table_id
                  WHERE b.restaurant_id = ? AND b.datetime >= ? AND b.datetime < ?
                  ORDER BY b.datetime, b.last_name`,
            parameters: [restaurantId, toTimestamptz(start), toTimestamptz(end)],
        })
        .watch();

    activeWatch.registerListener({
        onData: (bookings) => renderBookings(bookings),
    });
}

/**
 * @param {{ db: import('@powersync/web').PowerSyncDatabase, onNavigate: Function, registerOnAccountSwitch: Function }} ctx
 */
export async function mountManagerView(ctx) {
    db = ctx.db;
    onNavigate = ctx.onNavigate;
    abortController = new AbortController();
    const { signal } = abortController;

    const viewRoot = root();
    if (!viewRoot) return;

    dateBar = mountBookingDateBar({
        viewRoot,
        db,
        signal,
        ids: MANAGER_DATE_BAR_IDS,
        unavailableHeaderText: 'Bookings unavailable',
        onDateChange: () => {
            void subscribeBookings();
        },
    });

    unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
        void subscribeBookings();
    });

    await subscribeBookings();
}

export async function unmountManagerView() {
    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    await dateBar?.destroy();
    dateBar = null;

    abortController?.abort();
    abortController = null;
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;
    db = null;
    onNavigate = null;
}
