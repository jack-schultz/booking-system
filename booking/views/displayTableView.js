import {
    aggregateBookingsByDay,
    deleteBooking,
    formatTimeslot,
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

const DISPLAY_TABLE_DATE_BAR_IDS = {
    dateLeft: 'display-table-list-date-left',
    dateRight: 'display-table-list-date-right',
    datePicker: 'display-table-date-picker',
    dateHeader: 'display-table-list-header',
    headerPax: 'display-table-header-pax',
    dateDropdown: 'display-table-date-dropdown',
    dateDropdownList: 'display-table-date-dropdown-list',
    dateToday: 'display-table-date-today',
};

const root = () => document.getElementById('view-display-table');

async function advanceBookingStatus(bookingId, status) {
    const nextStatus = getNextBookingStatus(status);
    await updateBookingStatus(db, bookingId, getActiveRestaurantId(), nextStatus);
}

function wireBookingRow(row, detailRow, booking) {
    row.addEventListener('click', () => {
        detailRow.classList.toggle('is-expanded');
    });

    row.querySelector('.booking-detail-status').addEventListener('click', async (event) => {
        event.stopPropagation();
        await advanceBookingStatus(
            event.currentTarget.getAttribute('data-id'),
            booking.status,
        );
    });

    detailRow.querySelector('.booking-action-delete').addEventListener('click', async (event) => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this booking?')) {
            await deleteBooking(db, booking.id, getActiveRestaurantId());
        }
    });

    detailRow.querySelector('.booking-action-edit').addEventListener('click', (event) => {
        event.stopPropagation();
        const id = event.target.getAttribute('data-id');
        onNavigate?.('create', { edit: id, returnTo: 'display-table' });
    });
}

function renderBookings(bookings) {
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingList = viewRoot.querySelector('#display-table-booking-list');

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings for today. (or they are still downloading)</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'booking-display-table';

    table.innerHTML = `
        <thead>
            <tr>
                <th>Time</th>
                <th>Guest</th>
                <th>Table</th>
                <th>Pax</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    bookings.forEach((booking) => {
        const preference = booking.preference !== 'none'
            ? `<span class="booking-display-table-preference">${booking.preference.charAt(0).toUpperCase() + booking.preference.slice(1)}</span>`
            : '';

        const tableCell = booking.table_name
            ? booking.table_name
            : '<span class="booking-summary-table is-unassigned">No table</span>';

        const statusClass = getBookingStatusClass(booking.status);
        const statusLabel = getBookingStatusLabel(booking.status);

        const row = document.createElement('tr');
        row.className = 'booking-display-table-row';
        row.innerHTML = `
            <td class="booking-display-table-time">${formatTimeslot(booking.datetime)}</td>
            <td class="booking-display-table-guest">
                <span class="booking-display-table-name">${booking.first_name} ${booking.last_name}</span>
                ${preference}
            </td>
            <td class="booking-display-table-table">${tableCell}</td>
            <td class="booking-display-table-pax"><span class="booking-summary-pax">${formatPaxBreakdown(booking)}</span></td>
            <td class="booking-display-table-status">
                <button type="button" class="booking-detail-status ${statusClass}" data-id="${booking.id}">${statusLabel}</button>
            </td>
        `;

        const detailRow = document.createElement('tr');
        detailRow.className = 'booking-display-table-details';
        detailRow.innerHTML = `
            <td colspan="5">
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
            </td>
        `;

        wireBookingRow(row, detailRow, booking);
        tbody.append(row, detailRow);
    });

    const { dayTotal, lunch, dinner } = aggregateBookingsByDay(bookings);
    const totals = document.createElement('div');
    totals.className = 'booking-display-table-totals';
    totals.innerHTML = `
        <div class="booking-display-table-totals-item">
            <span class="booking-display-table-totals-label">Lunch</span>
            ${formatPaxSummary(lunch)}
        </div>
        <div class="booking-display-table-totals-item">
            <span class="booking-display-table-totals-label">Dinner</span>
            ${formatPaxSummary(dinner)}
        </div>
        <div class="booking-display-table-totals-item">
            <span class="booking-display-table-totals-label">Total Pax</span>
            ${formatPaxSummary(dayTotal)}
        </div>
        <div class="booking-display-table-totals-item">
            <span class="booking-display-table-totals-label">Bookings</span>
            <span class="booking-display-table-totals-count">${bookings.length}</span>
        </div>
    `;

    bookingList.innerHTML = '';
    bookingList.append(table, totals);
}

function showUnassignedNotice() {
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingNotice = viewRoot.querySelector('#display-table-notice');
    const bookingList = viewRoot.querySelector('#display-table-booking-list');
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

    const bookingNotice = viewRoot.querySelector('#display-table-notice');
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
export async function mountDisplayTableView(ctx) {
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
        ids: DISPLAY_TABLE_DATE_BAR_IDS,
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

export async function unmountDisplayTableView() {
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
