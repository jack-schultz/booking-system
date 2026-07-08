import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import {
    aggregateBookingsByDay,
    addBookingToDayTotals,
    createDayPaxTotals,
    createEmptyPaxTotals,
    addPaxTotals,
    deleteBooking,
    formatTimeslot,
    getDateFromDatetime,
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
import { formatMealPaxSummary, formatPaxBreakdown, formatPaxSummary } from '../ui/paxSummary.js';
import { STORAGE_KEYS } from '../config/constants.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
    showSyncIndicator: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'));

const bookingList = document.getElementById('booking-list');
const bookingNotice = document.getElementById('booking-notice');
const bookingHeaderPax = document.getElementById('booking-header-pax');
const datePicker = document.getElementById('booking-date-picker');
const dateDropdown = document.getElementById('booking-date-dropdown');
const dateDropdownList = document.getElementById('booking-date-dropdown-list');
const dateTodayButton = document.getElementById('booking-date-today');

const DATE_PICKER_RANGE = 14;

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => subscribeBookings(),
});

const db = await initDatabase();

function getTodayDate() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

function normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function formatDateKey(date) {
    const normalized = normalizeDate(date);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, '0');
    const day = String(normalized.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const date = new Date(`${key}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isSameCalendarDay(left, right) {
    return formatDateKey(left) === formatDateKey(right);
}

function loadSelectedDate() {
    const stored = localStorage.getItem(STORAGE_KEYS.MANAGER_SELECTED_DATE);
    return parseDateKey(stored) ?? getTodayDate();
}

function saveSelectedDate(date) {
    localStorage.setItem(STORAGE_KEYS.MANAGER_SELECTED_DATE, formatDateKey(date));
}

function formatDropdownDateLabel(date) {
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function getDateRange(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
}

let selectedDate = loadSelectedDate();
let activeWatch = null;

updateTodayButton();

function closeDateDropdown() {
    dateDropdown.hidden = true;
    datePicker.setAttribute('aria-expanded', 'false');
}

function updateTodayButton() {
    dateTodayButton.disabled = isSameCalendarDay(selectedDate, getTodayDate());
}

function buildPaxByDateMap(bookings, centerDate) {
    const paxByDate = new Map();

    for (let offset = -DATE_PICKER_RANGE; offset <= DATE_PICKER_RANGE; offset += 1) {
        paxByDate.set(formatDateKey(addDays(centerDate, offset)), createDayPaxTotals());
    }

    for (const booking of bookings) {
        const dateKey = getDateFromDatetime(booking.datetime);
        const dayTotals = paxByDate.get(dateKey);
        if (dayTotals) {
            addBookingToDayTotals(dayTotals, booking);
        }
    }

    return paxByDate;
}

async function fetchDropdownBookings(centerDate) {
    const start = addDays(centerDate, -DATE_PICKER_RANGE);
    const end = addDays(centerDate, DATE_PICKER_RANGE + 1);
    return db.getAll(
        `SELECT * FROM bookings
         WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
         ORDER BY datetime`,
        [getActiveRestaurantId(), toTimestamptz(start), toTimestamptz(end)],
    );
}

async function renderDateDropdown() {
    const today = getTodayDate();
    const selectedKey = formatDateKey(selectedDate);
    let paxByDate = new Map();

    if (hasAssignedRestaurant()) {
        const bookings = await fetchDropdownBookings(selectedDate);
        paxByDate = buildPaxByDateMap(bookings, selectedDate);
    }

    dateDropdownList.innerHTML = '';

    for (let offset = -DATE_PICKER_RANGE; offset <= DATE_PICKER_RANGE; offset += 1) {
        const date = addDays(selectedDate, offset);
        const dateKey = formatDateKey(date);
        const { dayTotal, lunch, dinner } = paxByDate.get(dateKey) ?? createDayPaxTotals();
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'booking-date-option';
        btn.role = 'option';
        btn.innerHTML = `
            <span class="booking-date-option-label">${formatDropdownDateLabel(date)}</span>
            <span class="booking-date-option-pax">${formatMealPaxSummary({ dayTotal, lunch, dinner })}</span>
        `;

        if (dateKey === selectedKey) {
            btn.classList.add('is-selected');
            btn.setAttribute('aria-selected', 'true');
        } else {
            btn.setAttribute('aria-selected', 'false');
        }

        if (isSameCalendarDay(date, today)) {
            btn.classList.add('is-today');
        }

        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            setSelectedDate(date);
        });

        dateDropdownList.appendChild(btn);
    }
}

async function openDateDropdown() {
    await renderDateDropdown();
    dateDropdown.hidden = false;
    datePicker.setAttribute('aria-expanded', 'true');
    const selectedOption = dateDropdownList.querySelector('.booking-date-option.is-selected');
    selectedOption?.scrollIntoView({ block: 'nearest' });
}

async function toggleDateDropdown() {
    if (dateDropdown.hidden) {
        await openDateDropdown();
    } else {
        closeDateDropdown();
    }
}

function setSelectedDate(date) {
    selectedDate = normalizeDate(date);
    saveSelectedDate(selectedDate);
    updateTodayButton();
    closeDateDropdown();
    subscribeBookings();
}

function goToToday() {
    setSelectedDate(getTodayDate());
}

datePicker.addEventListener('click', (event) => {
    event.stopPropagation();
    void toggleDateDropdown();
});

datePicker.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        void toggleDateDropdown();
    } else if (event.key === 'Escape') {
        closeDateDropdown();
    }
});

dateDropdown.addEventListener('click', (event) => {
    event.stopPropagation();
});

dateTodayButton.addEventListener('click', (event) => {
    event.stopPropagation();
    goToToday();
});

document.addEventListener('click', () => {
    closeDateDropdown();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeDateDropdown();
    }
});

document.getElementById('booking-list-date-left').addEventListener('click', () => {
    setSelectedDate(addDays(selectedDate, -1));
});
document.getElementById('booking-list-date-right').addEventListener('click', () => {
    setSelectedDate(addDays(selectedDate, 1));
});

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

function getOrCreateTimeslotGroup(timeslot, datetime, paxTotals) {
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

function renderDayHeader(date, bookings) {
    const header = document.getElementById('booking-list-header');
    header.textContent = date.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const { dayTotal, lunch, dinner } = aggregateBookingsByDay(bookings);
    bookingHeaderPax.innerHTML = formatMealPaxSummary({ dayTotal, lunch, dinner });
    bookingHeaderPax.hidden = false;
}

function renderBookings(bookings, date) {
    renderDayHeader(date, bookings);

    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings for today</p>';
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
        );

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
    bookingNotice.hidden = false;
    bookingNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    bookingList.innerHTML = '';
    document.getElementById('booking-list-header').textContent = 'Bookings unavailable';
    bookingHeaderPax.hidden = true;
    bookingHeaderPax.innerHTML = '';
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

    const date = selectedDate;
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
