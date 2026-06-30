import {
    buildDatetime,
    formatTimeslot,
    fromTimestamptz,
    getDateFromDatetime,
    getTimeslotFromDatetime,
    toTimestamptz,
} from './bookings.js';

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
