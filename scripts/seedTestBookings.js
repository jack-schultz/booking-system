import { BOOKING_STATUS } from '../config/constants.js';
import { TIMESLOT_OPTIONS } from '../config/timeslots.js';
import { buildDatetime, insertBooking, toTimestamptz } from '../db/bookings.js';

export const SEED_DEFAULTS = {
    bookingCount: 200,
    daySpan: 20,
};

const FIRST_NAMES = [
    'James', 'Olivia', 'William', 'Charlotte', 'Jack', 'Amelia', 'Noah', 'Isla',
    'Thomas', 'Mia', 'Henry', 'Ava', 'Liam', 'Sophie', 'Lucas', 'Emily',
    'Ethan', 'Grace', 'Mason', 'Chloe', 'Oliver', 'Zoe', 'Leo', 'Ruby',
];

const LAST_NAMES = [
    'Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Thomas',
    'White', 'Martin', 'Thompson', 'Walker', 'Harris', 'Lee', 'Clark', 'Lewis',
    'Robinson', 'Hall', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker',
];

const PREFERENCES = ['none', 'table', 'booth', 'window'];

const NOTES = [
    '',
    '',
    '',
    'Birthday celebration',
    'Anniversary dinner',
    'Allergies: nuts',
    'Wheelchair access please',
    'Quiet table if possible',
    'Running 10 minutes late',
    'First time visiting',
];

/** @typedef {{ random?: () => number }} RngOptions */

function randomInt(min, max, random = Math.random) {
    return Math.floor(random() * (max - min + 1)) + min;
}

function pickRandom(items, random = Math.random) {
    return items[randomInt(0, items.length - 1, random)];
}

/** Higher weight near 12:00 and 18:30 service peaks. */
function buildTimeslotWeights() {
    const weights = new Map();

    for (const { value } of TIMESLOT_OPTIONS) {
        const hours = parseInt(value.slice(0, 2), 10);
        const minutes = parseInt(value.slice(2), 10);
        const totalMinutes = hours * 60 + minutes;

        let weight = 1;

        const lunchPeak = 12 * 60;
        const dinnerPeak = 18 * 60 + 30;
        const lunchDistance = Math.abs(totalMinutes - lunchPeak);
        const dinnerDistance = Math.abs(totalMinutes - dinnerPeak);
        const nearestPeakDistance = Math.min(lunchDistance, dinnerDistance);

        if (nearestPeakDistance === 0) {
            weight = 10;
        } else if (nearestPeakDistance <= 15) {
            weight = 7;
        } else if (nearestPeakDistance <= 45) {
            weight = 4;
        } else if (nearestPeakDistance <= 90) {
            weight = 2;
        }

        weights.set(value, weight);
    }

    return weights;
}

const TIMESLOT_WEIGHTS = buildTimeslotWeights();

export function pickWeightedTimeslot(random = Math.random) {
    let totalWeight = 0;
    for (const weight of TIMESLOT_WEIGHTS.values()) {
        totalWeight += weight;
    }

    let roll = random() * totalWeight;
    for (const { value } of TIMESLOT_OPTIONS) {
        roll -= TIMESLOT_WEIGHTS.get(value);
        if (roll <= 0) {
            return value;
        }
    }

    return TIMESLOT_OPTIONS[TIMESLOT_OPTIONS.length - 1].value;
}

/**
 * Split total_pax into adults, children, and high chairs.
 * Mostly adults; children less common; HC rare and capped by child count.
 */
export function generatePaxBreakdown(totalPax, random = Math.random) {
    let childPax = 0;
    let hcPax = 0;

    if (totalPax > 1 && random() < 0.42) {
        const maxChildren = Math.min(totalPax - 1, Math.max(1, Math.ceil(totalPax * 0.45)));
        childPax = randomInt(1, maxChildren, random);
    }

    if (childPax > 0 && random() < 0.22) {
        hcPax = randomInt(1, Math.min(childPax, 2), random);
    }

    const adultPax = totalPax - childPax - hcPax;

    return {
        total_pax: totalPax,
        adult_pax: adultPax,
        child_pax: childPax,
        hc_pax: hcPax,
    };
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Inclusive date range of `daySpan` days centered on anchorDate. */
export function getSeedDateRange(anchorDate = new Date(), daySpan = SEED_DEFAULTS.daySpan) {
    const anchor = new Date(anchorDate);
    anchor.setHours(0, 0, 0, 0);

    const startOffset = -Math.floor((daySpan - 1) / 2);
    const start = new Date(anchor);
    start.setDate(anchor.getDate() + startOffset);

    const end = new Date(start);
    end.setDate(start.getDate() + daySpan);

    return { start, end, anchor };
}

function pickSeedDate(start, end, random = Math.random) {
    const dayCount = Math.round((end - start) / (24 * 60 * 60 * 1000));
    const offset = randomInt(0, Math.max(0, dayCount - 1), random);
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    return date;
}

function pickStatusForDate(bookingDate, anchorDate, random = Math.random) {
    const bookingDay = new Date(bookingDate);
    bookingDay.setHours(0, 0, 0, 0);
    const today = new Date(anchorDate);
    today.setHours(0, 0, 0, 0);

    if (bookingDay < today) {
        const roll = random();
        if (roll < 0.55) return BOOKING_STATUS.SEATED;
        if (roll < 0.85) return BOOKING_STATUS.SET;
        return BOOKING_STATUS.PENDING;
    }

    if (bookingDay.getTime() === today.getTime()) {
        const roll = random();
        if (roll < 0.35) return BOOKING_STATUS.SEATED;
        if (roll < 0.7) return BOOKING_STATUS.SET;
        return BOOKING_STATUS.PENDING;
    }

    const roll = random();
    if (roll < 0.15) return BOOKING_STATUS.SET;
    return BOOKING_STATUS.PENDING;
}

function generatePhone(random = Math.random) {
    return `04${randomInt(10, 99, random)}${randomInt(100000, 999999, random)}`;
}

export function generateRandomBooking({
    restaurantId,
    profileId = null,
    anchorDate = new Date(),
    daySpan = SEED_DEFAULTS.daySpan,
    random = Math.random,
    id = crypto.randomUUID(),
    createdAt = new Date(),
} = {}) {
    if (restaurantId == null) {
        throw new Error('restaurantId is required');
    }

    const { start, end, anchor } = getSeedDateRange(anchorDate, daySpan);
    const bookingDate = pickSeedDate(start, end, random);
    const dateStr = formatDateInput(bookingDate);
    const timeslot = pickWeightedTimeslot(random);
    const totalPax = randomInt(1, 20, random);
    const pax = generatePaxBreakdown(totalPax, random);
    const firstName = pickRandom(FIRST_NAMES, random);
    const lastName = pickRandom(LAST_NAMES, random);

    return {
        id,
        created_at: toTimestamptz(createdAt),
        restaurant_id: restaurantId,
        profile_id: profileId,
        datetime: buildDatetime(dateStr, timeslot),
        first_name: firstName,
        last_name: lastName,
        phone_number: generatePhone(random),
        email: random() < 0.65 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com` : null,
        preference: pickRandom(PREFERENCES, random),
        status: pickStatusForDate(bookingDate, anchor, random),
        notes: pickRandom(NOTES, random) || null,
        ...pax,
    };
}

export function generateTestBookings({
    count = SEED_DEFAULTS.bookingCount,
    restaurantId,
    profileId = null,
    anchorDate = new Date(),
    daySpan = SEED_DEFAULTS.daySpan,
    random = Math.random,
} = {}) {
    const bookings = [];
    for (let index = 0; index < count; index += 1) {
        bookings.push(
            generateRandomBooking({
                restaurantId,
                profileId,
                anchorDate,
                daySpan,
                random,
            })
        );
    }
    return bookings;
}

export async function seedTestBookings(db, {
    count = SEED_DEFAULTS.bookingCount,
    restaurantId,
    profileId = null,
    anchorDate = new Date(),
    daySpan = SEED_DEFAULTS.daySpan,
    random = Math.random,
    onProgress,
} = {}) {
    const bookings = generateTestBookings({
        count,
        restaurantId,
        profileId,
        anchorDate,
        daySpan,
        random,
    });

    for (let index = 0; index < bookings.length; index += 1) {
        await insertBooking(db, bookings[index]);
        onProgress?.(index + 1, bookings.length, bookings[index]);
    }

    return bookings;
}
