import {
    generatePaxBreakdown,
    generateTestBookings,
    getSeedDateRange,
    pickWeightedTimeslot,
    SEED_DEFAULTS,
} from './seedTestBookings.js';

describe('generatePaxBreakdown', () => {
    test('totals always match and adults are the majority', () => {
        const random = () => 0.99;

        for (let total = 1; total <= 20; total += 1) {
            const pax = generatePaxBreakdown(total, random);
            expect(pax.total_pax).toBe(total);
            expect(pax.adult_pax + pax.child_pax + pax.hc_pax).toBe(total);
            expect(pax.adult_pax).toBeGreaterThanOrEqual(1);
            expect(pax.hc_pax).toBeLessThanOrEqual(pax.child_pax);
        }
    });
});

describe('pickWeightedTimeslot', () => {
    test('favors lunch and dinner peaks over off-peak slots', () => {
        const counts = new Map();

        for (let index = 0; index < 5000; index += 1) {
            const slot = pickWeightedTimeslot(Math.random);
            counts.set(slot, (counts.get(slot) ?? 0) + 1);
        }

        expect(counts.get('1200') ?? 0).toBeGreaterThan(counts.get('0900') ?? 0);
        expect(counts.get('1830') ?? 0).toBeGreaterThan(counts.get('2100') ?? 0);
    });
});

describe('generateTestBookings', () => {
    test('creates the requested number of bookings in the date window', () => {
        const anchorDate = new Date('2026-07-08T12:00:00');
        const bookings = generateTestBookings({
            count: 50,
            restaurantId: 1,
            anchorDate,
            daySpan: 20,
            random: () => 0.5,
        });

        const { start, end } = getSeedDateRange(anchorDate, 20);

        expect(bookings).toHaveLength(50);
        for (const booking of bookings) {
            expect(booking.restaurant_id).toBe(1);
            expect(booking.total_pax).toBeGreaterThanOrEqual(1);
            expect(booking.total_pax).toBeLessThanOrEqual(20);

            const bookingDate = new Date(booking.datetime);
            expect(bookingDate.getTime()).toBeGreaterThanOrEqual(start.getTime());
            expect(bookingDate.getTime()).toBeLessThan(end.getTime());
        }
    });

    test('defaults match seed script configuration', () => {
        expect(SEED_DEFAULTS.bookingCount).toBe(200);
        expect(SEED_DEFAULTS.daySpan).toBe(20);
    });
});
