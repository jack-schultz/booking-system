import { BOOKING_STATUS } from '../config/constants.js';

export function buildDatetime(dateStr, timeslot) {
    const str = timeslot.toString().padStart(4, '0');
    return `${dateStr}T${str.slice(0, 2)}:${str.slice(2)}:00`;
}

export function getTimeslotFromDatetime(datetime) {
    if (!datetime) return '';
    const match = datetime.match(/T(\d{2}):(\d{2})/);
    if (match) return match[1] + match[2];
    const d = new Date(datetime);
    if (!Number.isNaN(d.getTime())) {
        return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    }
    return datetime;
}

export function getDateFromDatetime(datetime) {
    if (!datetime) return '';
    return datetime.split('T')[0];
}

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

export async function getBookingsForDate(db, dateStr, restaurantId) {
    return db.getAll(
        `SELECT * FROM bookings
         WHERE restaurant_id = ? AND date(datetime) = date(?)
         ORDER BY datetime, last_name`,
        [restaurantId, dateStr]
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
            booking.status ?? BOOKING_STATUS.CONFIRMED,
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
            booking.status ?? BOOKING_STATUS.CONFIRMED,
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
