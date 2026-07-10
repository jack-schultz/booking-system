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
} from '../../db/bookings.js';
import {
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';
import { formatMealPaxSummary, formatPaxBreakdown, formatPaxSummary } from '../../ui/paxSummary.js';
import { STORAGE_KEYS } from '../../config/constants.js';

const DATE_PICKER_MONTHS_PAST = 1;
const DATE_PICKER_MONTHS_FUTURE = 12;

/** @type {AbortController | null} */
let abortController = null;
/** @type {import('@powersync/web').SyncStreamSubscription | null} */
let activeWatch = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
/** @type {Set<string>} */
let expandedDropdownMonths = new Set();
let db = null;
let onNavigate = null;
let selectedDate = null;

const root = () => document.getElementById('view-manager');

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

function getMonthStart(date) {
    const result = normalizeDate(date);
    result.setDate(1);
    return result;
}

function addMonths(date, months) {
    const result = getMonthStart(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function getDaysInMonth(monthStart) {
    const start = getMonthStart(monthStart);
    const days = [];
    const cursor = new Date(start);

    while (cursor.getMonth() === start.getMonth()) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return days;
}

function getDropdownMonthStarts() {
    const today = getTodayDate();
    const months = [];

    for (let offset = -DATE_PICKER_MONTHS_PAST; offset <= DATE_PICKER_MONTHS_FUTURE; offset += 1) {
        months.push(addMonths(today, offset));
    }

    return months;
}

function getDropdownDateRange(monthStarts) {
    const start = getMonthStart(monthStarts[0]);
    const end = addMonths(getMonthStart(monthStarts[monthStarts.length - 1]), 1);
    return { start, end };
}

function formatDateKey(date) {
    const normalized = normalizeDate(date);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, '0');
    const day = String(normalized.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatMonthKey(date) {
    const normalized = normalizeDate(date);
    const year = normalized.getFullYear();
    const month = String(normalized.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
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

function formatDropdownDayLabel(date) {
    return date.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
    });
}

function formatDropdownMonthLabel(date) {
    return date.toLocaleDateString('en-AU', {
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

function closeDateDropdown() {
    const dateDropdown = root()?.querySelector('#booking-date-dropdown');
    const datePicker = root()?.querySelector('#booking-date-picker');
    if (dateDropdown) dateDropdown.hidden = true;
    datePicker?.setAttribute('aria-expanded', 'false');
}

function updateTodayButton() {
    const dateTodayButton = root()?.querySelector('#booking-date-today');
    if (dateTodayButton) {
        dateTodayButton.disabled = isSameCalendarDay(selectedDate, getTodayDate());
    }
}

function buildPaxByDateMap(bookings, monthStarts) {
    const paxByDate = new Map();

    for (const monthStart of monthStarts) {
        for (const date of getDaysInMonth(monthStart)) {
            paxByDate.set(formatDateKey(date), createDayPaxTotals());
        }
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

async function fetchDropdownBookings(monthStarts) {
    const { start, end } = getDropdownDateRange(monthStarts);
    return db.getAll(
        `SELECT * FROM bookings
         WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
         ORDER BY datetime`,
        [getActiveRestaurantId(), toTimestamptz(start), toTimestamptz(end)],
    );
}

function getDefaultExpandedMonths() {
    return new Set([formatMonthKey(getTodayDate())]);
}

function createDateOption(date, { dayTotal, lunch, dinner }, { selectedKey, today }) {
    const dateKey = formatDateKey(date);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'booking-date-option';
    btn.role = 'option';
    btn.innerHTML = `
        <span class="booking-date-option-label">${formatDropdownDayLabel(date)}</span>
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

    return btn;
}

function createMonthGroup(monthStart, paxByDate, { selectedKey, today }) {
    const monthKey = formatMonthKey(monthStart);
    const isExpanded = expandedDropdownMonths.has(monthKey);
    const group = document.createElement('div');
    group.className = 'booking-date-month-group';
    if (isExpanded) {
        group.classList.add('is-expanded');
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'booking-date-month-toggle';
    toggle.dataset.monthKey = monthKey;
    toggle.setAttribute('aria-expanded', String(isExpanded));
    toggle.innerHTML = `
        <span class="booking-month-separator-label">${formatDropdownMonthLabel(monthStart)}</span>
        <span class="booking-date-month-chevron" aria-hidden="true"></span>
    `;

    const days = document.createElement('div');
    days.className = 'booking-date-month-days';
    days.hidden = !isExpanded;

    for (const date of getDaysInMonth(monthStart)) {
        const dateKey = formatDateKey(date);
        const { dayTotal, lunch, dinner } = paxByDate.get(dateKey) ?? createDayPaxTotals();
        days.appendChild(createDateOption(date, { dayTotal, lunch, dinner }, { selectedKey, today }));
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextExpanded = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(nextExpanded));
        days.hidden = !nextExpanded;
        group.classList.toggle('is-expanded', nextExpanded);

        if (nextExpanded) {
            expandedDropdownMonths.add(monthKey);
        } else {
            expandedDropdownMonths.delete(monthKey);
        }
    });

    group.append(toggle, days);
    return group;
}

async function renderDateDropdown() {
    const viewRoot = root();
    if (!viewRoot) return;

    const dateDropdownList = viewRoot.querySelector('#booking-date-dropdown-list');
    const today = getTodayDate();
    const selectedKey = formatDateKey(selectedDate);
    const monthStarts = getDropdownMonthStarts();
    let paxByDate = new Map();

    if (hasAssignedRestaurant()) {
        const bookings = await fetchDropdownBookings(monthStarts);
        paxByDate = buildPaxByDateMap(bookings, monthStarts);
    } else {
        paxByDate = buildPaxByDateMap([], monthStarts);
    }

    dateDropdownList.innerHTML = '';

    for (const monthStart of monthStarts) {
        dateDropdownList.appendChild(
            createMonthGroup(monthStart, paxByDate, { selectedKey, today }),
        );
    }
}

async function openDateDropdown() {
    const viewRoot = root();
    if (!viewRoot) return;

    expandedDropdownMonths = getDefaultExpandedMonths();
    await renderDateDropdown();
    const dateDropdown = viewRoot.querySelector('#booking-date-dropdown');
    const datePicker = viewRoot.querySelector('#booking-date-picker');
    const dateDropdownList = viewRoot.querySelector('#booking-date-dropdown-list');
    dateDropdown.hidden = false;
    datePicker.setAttribute('aria-expanded', 'true');
    dateDropdownList.querySelector('.booking-date-option.is-selected')?.scrollIntoView({ block: 'nearest' });
}

async function toggleDateDropdown() {
    const viewRoot = root();
    if (!viewRoot) return;

    const dateDropdown = viewRoot.querySelector('#booking-date-dropdown');
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
    void subscribeBookings();
}

function goToToday() {
    setSelectedDate(getTodayDate());
}

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

function renderDayHeader(date, bookings) {
    const viewRoot = root();
    if (!viewRoot) return;

    const header = viewRoot.querySelector('#booking-list-header');
    const bookingHeaderPax = viewRoot.querySelector('#booking-header-pax');
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
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingList = viewRoot.querySelector('#booking-list');
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
            bookingList,
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
    const bookingHeaderPax = viewRoot.querySelector('#booking-header-pax');
    bookingNotice.hidden = false;
    bookingNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    bookingList.innerHTML = '';
    viewRoot.querySelector('#booking-list-header').textContent = 'Bookings unavailable';
    bookingHeaderPax.hidden = true;
    bookingHeaderPax.innerHTML = '';
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
    if (!viewRoot) return;

    const bookingNotice = viewRoot.querySelector('#booking-notice');
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

    activeWatch.registerListener({
        onData: (bookings) => renderBookings(bookings, date),
    });
}

/**
 * @param {{ db: import('@powersync/web').PowerSyncDatabase, onNavigate: Function, registerOnAccountSwitch: Function }} ctx
 */
export async function mountManagerView(ctx) {
    db = ctx.db;
    onNavigate = ctx.onNavigate;
    selectedDate = loadSelectedDate();
    abortController = new AbortController();
    const { signal } = abortController;

    const viewRoot = root();
    if (!viewRoot) return;

    const datePicker = viewRoot.querySelector('#booking-date-picker');
    const dateDropdown = viewRoot.querySelector('#booking-date-dropdown');
    const dateTodayButton = viewRoot.querySelector('#booking-date-today');

    updateTodayButton();

    datePicker.addEventListener('click', (event) => {
        event.stopPropagation();
        void toggleDateDropdown();
    }, { signal });

    datePicker.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void toggleDateDropdown();
        } else if (event.key === 'Escape') {
            closeDateDropdown();
        }
    }, { signal });

    dateDropdown.addEventListener('click', (event) => {
        event.stopPropagation();
    }, { signal });

    dateTodayButton.addEventListener('click', (event) => {
        event.stopPropagation();
        goToToday();
    }, { signal });

    document.addEventListener('click', () => {
        closeDateDropdown();
    }, { signal });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDateDropdown();
        }
    }, { signal });

    viewRoot.querySelector('#booking-list-date-left').addEventListener('click', () => {
        setSelectedDate(addDays(selectedDate, -1));
    }, { signal });

    viewRoot.querySelector('#booking-list-date-right').addEventListener('click', () => {
        setSelectedDate(addDays(selectedDate, 1));
    }, { signal });

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

    abortController?.abort();
    abortController = null;
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;
    closeDateDropdown();
    db = null;
    onNavigate = null;
}
