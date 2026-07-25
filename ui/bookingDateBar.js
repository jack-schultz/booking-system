import {
    aggregateBookingsByDay,
    addBookingToDayTotals,
    createDayPaxTotals,
    getDateFromDatetime,
    toTimestamptz,
} from '../db/bookings.js';
import {
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../auth/accountSwitcher.js';
import { formatMealPaxSummary } from './paxSummary.js';
import { STORAGE_KEYS } from '../config/constants.js';

const DATE_PICKER_MONTHS_PAST = 1;
const DATE_PICKER_MONTHS_FUTURE = 12;

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

export function formatDateKey(date) {
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

export function parseDateKey(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const date = new Date(`${key}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function isSameCalendarDay(left, right) {
    return formatDateKey(left) === formatDateKey(right);
}

export function loadSelectedDate() {
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

function formatHeaderDate(date) {
    return date.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * @param {{
 *   viewRoot: HTMLElement,
 *   db: import('@powersync/web').PowerSyncDatabase,
 *   signal: AbortSignal,
 *   ids: {
 *     dateLeft: string,
 *     dateRight: string,
 *     datePicker: string,
 *     dateHeader: string,
 *     headerPax: string,
 *     dateDropdown: string,
 *     dateDropdownList: string,
 *     dateToday: string,
 *   },
 *   initialDate?: Date,
 *   unavailableHeaderText?: string,
 *   onDateChange?: (date: Date) => void,
 * }} options
 */
export function mountBookingDateBar(options) {
    const {
        viewRoot,
        db,
        signal,
        ids,
        initialDate,
        unavailableHeaderText,
        onDateChange,
    } = options;

    const els = {
        dateLeft: viewRoot.querySelector(`#${ids.dateLeft}`),
        dateRight: viewRoot.querySelector(`#${ids.dateRight}`),
        datePicker: viewRoot.querySelector(`#${ids.datePicker}`),
        dateHeader: viewRoot.querySelector(`#${ids.dateHeader}`),
        headerPax: viewRoot.querySelector(`#${ids.headerPax}`),
        dateDropdown: viewRoot.querySelector(`#${ids.dateDropdown}`),
        dateDropdownList: viewRoot.querySelector(`#${ids.dateDropdownList}`),
        dateToday: viewRoot.querySelector(`#${ids.dateToday}`),
    };

    let selectedDate = normalizeDate(initialDate ?? loadSelectedDate());
    let expandedDropdownMonths = new Set([formatMonthKey(getTodayDate())]);
    /** @type {import('@powersync/web').SyncStreamSubscription | null} */
    let headerWatch = null;
    let headerUnavailable = false;

    function closeDateDropdown() {
        if (els.dateDropdown) els.dateDropdown.hidden = true;
        els.datePicker?.setAttribute('aria-expanded', 'false');
    }

    function updateTodayButton() {
        if (els.dateToday) {
            els.dateToday.disabled = isSameCalendarDay(selectedDate, getTodayDate());
        }
    }

    function renderDayHeader(date, bookings) {
        if (!els.dateHeader || !els.headerPax) return;

        els.dateHeader.textContent = formatHeaderDate(date);
        const { dayTotal, lunch, dinner } = aggregateBookingsByDay(bookings);
        els.headerPax.innerHTML = formatMealPaxSummary({ dayTotal, lunch, dinner });
        els.headerPax.hidden = false;
    }

    function renderEmptyHeader(date) {
        if (!els.dateHeader || !els.headerPax) return;

        const { dayTotal, lunch, dinner } = createDayPaxTotals();
        els.dateHeader.textContent = formatHeaderDate(date);
        els.headerPax.innerHTML = formatMealPaxSummary({ dayTotal, lunch, dinner });
        els.headerPax.hidden = false;
    }

    function setHeaderUnavailable() {
        headerUnavailable = true;
        if (els.dateHeader) {
            els.dateHeader.textContent = unavailableHeaderText ?? 'Unavailable';
        }
        if (els.headerPax) {
            els.headerPax.hidden = true;
            els.headerPax.innerHTML = '';
        }
    }

    function clearHeaderUnavailable() {
        headerUnavailable = false;
    }

    async function stopHeaderWatch() {
        if (headerWatch) {
            await headerWatch.close();
            headerWatch = null;
        }
    }

    async function subscribeHeaderPax() {
        await stopHeaderWatch();

        if (headerUnavailable) {
            return;
        }

        if (!hasAssignedRestaurant()) {
            if (unavailableHeaderText) {
                setHeaderUnavailable();
            } else {
                renderEmptyHeader(selectedDate);
            }
            return;
        }

        const date = selectedDate;
        const { start, end } = getDateRange(date);
        const restaurantId = getActiveRestaurantId();

        headerWatch = db
            .query({
                sql: `SELECT * FROM bookings
                      WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                      ORDER BY datetime`,
                parameters: [restaurantId, toTimestamptz(start), toTimestamptz(end)],
            })
            .watch();

        headerWatch.registerListener({
            onData: (bookings) => renderDayHeader(date, bookings),
        });
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
        if (!els.dateDropdownList) return;

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

        els.dateDropdownList.innerHTML = '';

        for (const monthStart of monthStarts) {
            els.dateDropdownList.appendChild(
                createMonthGroup(monthStart, paxByDate, { selectedKey, today }),
            );
        }
    }

    async function openDateDropdown() {
        expandedDropdownMonths = new Set([formatMonthKey(getTodayDate())]);
        await renderDateDropdown();
        if (els.dateDropdown) els.dateDropdown.hidden = false;
        els.datePicker?.setAttribute('aria-expanded', 'true');
        els.dateDropdownList?.querySelector('.booking-date-option.is-selected')
            ?.scrollIntoView({ block: 'nearest' });
    }

    async function toggleDateDropdown() {
        if (!els.dateDropdown) return;

        if (els.dateDropdown.hidden) {
            await openDateDropdown();
        } else {
            closeDateDropdown();
        }
    }

    function setSelectedDate(date, { silent = false } = {}) {
        selectedDate = normalizeDate(date);
        saveSelectedDate(selectedDate);
        updateTodayButton();
        closeDateDropdown();
        clearHeaderUnavailable();
        void subscribeHeaderPax();
        if (!silent) {
            onDateChange?.(selectedDate);
        }
    }

    function goToToday() {
        setSelectedDate(getTodayDate());
    }

    updateTodayButton();
    renderEmptyHeader(selectedDate);
    void subscribeHeaderPax();

    els.datePicker?.addEventListener('click', (event) => {
        event.stopPropagation();
        void toggleDateDropdown();
    }, { signal });

    els.datePicker?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void toggleDateDropdown();
        } else if (event.key === 'Escape') {
            closeDateDropdown();
        }
    }, { signal });

    els.dateDropdown?.addEventListener('click', (event) => {
        event.stopPropagation();
    }, { signal });

    els.dateToday?.addEventListener('click', (event) => {
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

    els.dateLeft?.addEventListener('click', () => {
        setSelectedDate(addDays(selectedDate, -1));
    }, { signal });

    els.dateRight?.addEventListener('click', () => {
        setSelectedDate(addDays(selectedDate, 1));
    }, { signal });

    return {
        getDate: () => new Date(selectedDate),
        setDate: (date, opts) => setSelectedDate(date, opts),
        refresh: () => {
            clearHeaderUnavailable();
            void subscribeHeaderPax();
        },
        setHeaderUnavailable,
        closeDropdown: closeDateDropdown,
        destroy: async () => {
            closeDateDropdown();
            await stopHeaderWatch();
        },
    };
}

export { getDateRange, normalizeDate, addDays };
