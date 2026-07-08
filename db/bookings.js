import { BOOKING_STATUS } from '../config/constants.js';
import { getMealPeriodFromDatetime } from '../config/timeslots.js';

/** Serialize a Date to PowerSync timestamptz text (ISO 8601 UTC, …Z). */
export function toTimestamptz(date) {
    return date.toISOString();
}

/** Parse a timestamptz or legacy local ISO string into a Date, or null if invalid. */
export function fromTimestamptz(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Combine a date input (YYYY-MM-DD) and compact timeslot (HHMM) into timestamptz. */
export function buildDatetime(dateStr, timeslot) {
    const str = timeslot.toString().padStart(4, '0');
    const date = new Date(`${dateStr}T${str.slice(0, 2)}:${str.slice(2)}:00`);
    return toTimestamptz(date);
}

/** Extract a compact timeslot (HHMM) from timestamptz for form fields. */
export function getTimeslotFromDatetime(datetime) {
    const date = fromTimestamptz(datetime);
    if (!date) return '';
    return `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
}

/** Extract a local date (YYYY-MM-DD) from timestamptz for form fields. */
export function getDateFromDatetime(datetime) {
    const date = fromTimestamptz(datetime);
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Format timestamptz as a display time (e.g. "9:00 am"). */
export function formatTimeslot(datetime) {
    const timeslot = getTimeslotFromDatetime(datetime);
    if (!timeslot) return '';
    const str = timeslot.toString().padStart(4, '0');
    let hours = parseInt(str.slice(0, 2), 10);
    const minutes = str.slice(2);
    const ampm = hours >= 12 ? 'pm' : 'am';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
}

/** List bookings for a local calendar day (date is a Date at local midnight). */
export async function getBookingsForDate(db, date, restaurantId) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return db.getAll(
        `SELECT * FROM bookings
         WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
         ORDER BY datetime, last_name`,
        [restaurantId, toTimestamptz(start), toTimestamptz(end)]
    );
}

export async function getBookingById(db, id, restaurantId) {
    return db.get(
        `SELECT * FROM bookings WHERE id = ? AND restaurant_id = ?`,
        [id, restaurantId]
    );
}

export async function insertBooking(db, booking) {
    await db.execute(
        `INSERT INTO bookings (
            id, created_at, restaurant_id, first_name, last_name, preference,
            datetime, profile_id, status, phone_number, email,
            total_pax, adult_pax, child_pax, hc_pax, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            booking.id,
            booking.created_at,
            booking.restaurant_id,
            booking.first_name,
            booking.last_name,
            booking.preference,
            booking.datetime,
            booking.profile_id ?? null,
            booking.status ?? BOOKING_STATUS.PENDING,
            booking.phone_number,
            booking.email ?? null,
            booking.total_pax,
            booking.adult_pax,
            booking.child_pax,
            booking.hc_pax,
            booking.notes ?? null,
        ]
    );
}

export async function updateBooking(db, id, booking, restaurantId) {
    await db.execute(
        `UPDATE bookings SET
            first_name = ?, last_name = ?, preference = ?, datetime = ?,
            phone_number = ?, email = ?, total_pax = ?, adult_pax = ?,
            child_pax = ?, hc_pax = ?, notes = ?, status = ?
        WHERE id = ? AND restaurant_id = ?`,
        [
            booking.first_name,
            booking.last_name,
            booking.preference,
            booking.datetime,
            booking.phone_number,
            booking.email ?? null,
            booking.total_pax,
            booking.adult_pax,
            booking.child_pax,
            booking.hc_pax,
            booking.notes ?? null,
            booking.status ?? BOOKING_STATUS.PENDING,
            id,
            restaurantId,
        ]
    );
}

export async function deleteBooking(db, id, restaurantId) {
    await db.execute(
        `DELETE FROM bookings WHERE id = ? AND restaurant_id = ?`,
        [id, restaurantId]
    );
}

export function getNextBookingStatus(status) {
    switch (status) {
        case BOOKING_STATUS.PENDING:
            return BOOKING_STATUS.SET;
        case BOOKING_STATUS.SET:
            return BOOKING_STATUS.SEATED;
        case BOOKING_STATUS.SEATED:
            return BOOKING_STATUS.PENDING;
        default:
            return BOOKING_STATUS.PENDING;
    }
}

export function getBookingStatusLabel(status) {
    switch (status) {
        case BOOKING_STATUS.PENDING:
            return 'Unset';
        case BOOKING_STATUS.SET:
            return 'Set';
        case BOOKING_STATUS.SEATED:
            return 'Seated';
        default:
            return 'Unset';
    }
}

export function getBookingStatusClass(status) {
    switch (status) {
        case BOOKING_STATUS.PENDING:
            return 'is-pending';
        case BOOKING_STATUS.SET:
            return 'is-set';
        case BOOKING_STATUS.SEATED:
            return 'is-seated';
        default:
            return 'is-pending';
    }
}

export async function updateBookingStatus(db, id, restaurantId, status) {
    await db.execute(
        `UPDATE bookings SET status = ? WHERE id = ? AND restaurant_id = ?`,
        [status, id, restaurantId]
    );
}

export function createEmptyPaxTotals() {
    return {
        total_pax: 0,
        adult_pax: 0,
        child_pax: 0,
        hc_pax: 0,
    };
}

export function addPaxTotals(target, source) {
    target.total_pax += source.total_pax;
    target.adult_pax += source.adult_pax;
    target.child_pax += source.child_pax;
    target.hc_pax += source.hc_pax;
}

export function createDayPaxTotals() {
    return {
        lunch: createEmptyPaxTotals(),
        dinner: createEmptyPaxTotals(),
        dayTotal: createEmptyPaxTotals(),
    };
}

export function addBookingToDayTotals(dayTotals, booking) {
    const meal = getMealPeriodFromDatetime(booking.datetime);
    addPaxTotals(dayTotals[meal], booking);
    addPaxTotals(dayTotals.dayTotal, booking);
}

export function aggregateBookingsByDay(bookings) {
    const totals = createDayPaxTotals();

    for (const booking of bookings) {
        addBookingToDayTotals(totals, booking);
    }

    return totals;
}

/** Monday 00:00 through next Monday 00:00 for the week containing anchorDate. */
export function getWeekRange(anchorDate, weekOffset = 0) {
    const date = new Date(anchorDate);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + weekOffset * 7);

    const daysFromMonday = (date.getDay() + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - daysFromMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return { start, end };
}

export function aggregateBookingsByWeek(bookings, weekStart) {
    const normalizedWeekStart = new Date(weekStart);
    normalizedWeekStart.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(normalizedWeekStart);
        date.setDate(normalizedWeekStart.getDate() + index);
        return {
            date,
            ...createDayPaxTotals(),
        };
    });

    for (const booking of bookings) {
        const bookingDate = fromTimestamptz(booking.datetime);
        if (!bookingDate) continue;

        const normalizedBookingDate = new Date(bookingDate);
        normalizedBookingDate.setHours(0, 0, 0, 0);
        const dayIndex = Math.round(
            (normalizedBookingDate - normalizedWeekStart) / (24 * 60 * 60 * 1000)
        );
        if (dayIndex < 0 || dayIndex > 6) continue;

        addBookingToDayTotals(days[dayIndex], booking);
    }

    const weekendTotal = createEmptyPaxTotals();
    addPaxTotals(weekendTotal, days[5].dayTotal);
    addPaxTotals(weekendTotal, days[6].dayTotal);

    const lunchTotal = createEmptyPaxTotals();
    const dinnerTotal = createEmptyPaxTotals();
    const weekTotal = createEmptyPaxTotals();
    for (const day of days) {
        addPaxTotals(lunchTotal, day.lunch);
        addPaxTotals(dinnerTotal, day.dinner);
        addPaxTotals(weekTotal, day.dayTotal);
    }

    return { days, lunchTotal, dinnerTotal, weekendTotal, weekTotal };
}
