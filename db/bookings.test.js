import {
    aggregateBookingsByDay,
    aggregateBookingsByWeek,
    buildDatetime,
    formatTimeslot,
    fromTimestamptz,
    getDateFromDatetime,
    getTimeslotFromDatetime,
    getWeekRange,
    toTimestamptz,
} from './bookings.js';
import { getMealPeriodFromDatetime } from '../config/timeslots.js';

describe('toTimestamptz / fromTimestamptz', () => {
    test('round-trips a Date as ISO UTC', () => {
        const date = new Date('2026-06-28T09:15:00');
        const ts = toTimestamptz(date);
        expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(fromTimestamptz(ts)?.getTime()).toBe(date.getTime());
    });

    test('returns null for invalid values', () => {
        expect(fromTimestamptz('')).toBeNull();
        expect(fromTimestamptz(null)).toBeNull();
        expect(fromTimestamptz('not-a-date')).toBeNull();
    });
});

describe('buildDatetime', () => {
    test('combines date and compact timeslot into timestamptz', () => {
        const result = buildDatetime('2026-06-28', '0900');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(getDateFromDatetime(result)).toBe('2026-06-28');
        expect(getTimeslotFromDatetime(result)).toBe('0900');
    });

    test('pads numeric timeslots', () => {
        const result = buildDatetime('2026-06-28', 915);
        expect(getDateFromDatetime(result)).toBe('2026-06-28');
        expect(getTimeslotFromDatetime(result)).toBe('0915');
    });
});

describe('getTimeslotFromDatetime', () => {
    test('extracts compact timeslot from timestamptz', () => {
        const ts = buildDatetime('2026-06-28', '0900');
        expect(getTimeslotFromDatetime(ts)).toBe('0900');
        expect(getTimeslotFromDatetime(buildDatetime('2026-06-28', '2130'))).toBe('2130');
    });

    test('extracts compact timeslot from legacy local ISO strings', () => {
        expect(getTimeslotFromDatetime('2026-06-28T09:00:00')).toBe('0900');
        expect(getTimeslotFromDatetime('2026-06-28T21:30:00')).toBe('2130');
    });

    test('returns empty string for missing datetime', () => {
        expect(getTimeslotFromDatetime('')).toBe('');
        expect(getTimeslotFromDatetime(null)).toBe('');
    });
});

describe('getDateFromDatetime', () => {
    test('extracts YYYY-MM-DD from timestamptz', () => {
        const ts = buildDatetime('2026-06-28', '0900');
        expect(getDateFromDatetime(ts)).toBe('2026-06-28');
    });

    test('extracts YYYY-MM-DD from legacy local ISO strings', () => {
        expect(getDateFromDatetime('2026-06-28T09:00:00')).toBe('2026-06-28');
    });

    test('returns empty string for missing datetime', () => {
        expect(getDateFromDatetime('')).toBe('');
        expect(getDateFromDatetime(null)).toBe('');
    });
});

describe('formatTimeslot', () => {
    test('formats morning, afternoon, and midnight-edge times', () => {
        expect(formatTimeslot(buildDatetime('2026-06-28', '0900'))).toBe('9:00 am');
        expect(formatTimeslot(buildDatetime('2026-06-28', '1200'))).toBe('12:00 pm');
        expect(formatTimeslot(buildDatetime('2026-06-28', '2130'))).toBe('9:30 pm');
    });

    test('formats legacy local ISO strings', () => {
        expect(formatTimeslot('2026-06-28T09:00:00')).toBe('9:00 am');
        expect(formatTimeslot('2026-06-28T12:00:00')).toBe('12:00 pm');
        expect(formatTimeslot('2026-06-28T21:30:00')).toBe('9:30 pm');
    });

    test('returns empty string for missing datetime', () => {
        expect(formatTimeslot('')).toBe('');
    });
});

describe('getMealPeriodFromDatetime', () => {
    test('classifies before 5pm as lunch and 5pm onwards as dinner', () => {
        expect(getMealPeriodFromDatetime(buildDatetime('2026-06-28', '1645'))).toBe('lunch');
        expect(getMealPeriodFromDatetime(buildDatetime('2026-06-28', '1700'))).toBe('dinner');
        expect(getMealPeriodFromDatetime(buildDatetime('2026-06-28', '1900'))).toBe('dinner');
    });
});

describe('getWeekRange', () => {
    test('returns Monday through next Monday for the containing week', () => {
        const { start, end } = getWeekRange(new Date(2026, 6, 8));
        expect(start.getDay()).toBe(1);
        expect(end.getDay()).toBe(1);
        expect(start.getDate()).toBe(6);
        expect(end.getDate()).toBe(13);
    });

    test('shifts by weekOffset', () => {
        const current = getWeekRange(new Date(2026, 6, 8), 0);
        const next = getWeekRange(new Date(2026, 6, 8), 1);
        expect(next.start.getTime() - current.start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });
});

describe('aggregateBookingsByDay', () => {
    test('aggregates pax by meal period and day total', () => {
        const bookings = [
            {
                datetime: buildDatetime('2026-07-06', '1200'),
                total_pax: 4,
                adult_pax: 3,
                child_pax: 1,
                hc_pax: 0,
            },
            {
                datetime: buildDatetime('2026-07-06', '1800'),
                total_pax: 2,
                adult_pax: 2,
                child_pax: 0,
                hc_pax: 1,
            },
        ];

        const { lunch, dinner, dayTotal } = aggregateBookingsByDay(bookings);

        expect(lunch.booking_count).toBe(1);
        expect(lunch.total_pax).toBe(4);
        expect(dinner.booking_count).toBe(1);
        expect(dinner.total_pax).toBe(2);
        expect(dayTotal.booking_count).toBe(2);
        expect(dayTotal.total_pax).toBe(6);
    });
});

describe('aggregateBookingsByWeek', () => {
    test('aggregates pax by day, meal period, weekend, and week totals', () => {
        const { start } = getWeekRange(new Date(2026, 6, 8));
        const bookings = [
            {
                datetime: buildDatetime('2026-07-06', '1200'),
                total_pax: 4,
                adult_pax: 3,
                child_pax: 1,
                hc_pax: 0,
            },
            {
                datetime: buildDatetime('2026-07-06', '1800'),
                total_pax: 2,
                adult_pax: 2,
                child_pax: 0,
                hc_pax: 1,
            },
            {
                datetime: buildDatetime('2026-07-11', '1300'),
                total_pax: 6,
                adult_pax: 4,
                child_pax: 2,
                hc_pax: 0,
            },
            {
                datetime: buildDatetime('2026-07-12', '1900'),
                total_pax: 8,
                adult_pax: 6,
                child_pax: 2,
                hc_pax: 2,
            },
        ];

        const { days, lunchTotal, dinnerTotal, weekendTotal, weekTotal } = aggregateBookingsByWeek(bookings, start);

        expect(days[0].lunch.total_pax).toBe(4);
        expect(days[0].dinner.total_pax).toBe(2);
        expect(days[0].dayTotal.total_pax).toBe(6);
        expect(days[5].dayTotal.total_pax).toBe(6);
        expect(days[6].dayTotal.total_pax).toBe(8);
        expect(lunchTotal.total_pax).toBe(10);
        expect(dinnerTotal.total_pax).toBe(10);
        expect(weekendTotal.total_pax).toBe(14);
        expect(weekTotal.total_pax).toBe(20);
    });
});
