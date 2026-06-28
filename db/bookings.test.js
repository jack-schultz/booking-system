import {
    buildDatetime,
    formatTimeslot,
    getDateFromDatetime,
    getTimeslotFromDatetime,
} from './bookings.js';

describe('buildDatetime', () => {
    test('combines date and compact timeslot into ISO local datetime', () => {
        expect(buildDatetime('2026-06-28', '0900')).toBe('2026-06-28T09:00:00');
        expect(buildDatetime('2026-06-28', 915)).toBe('2026-06-28T09:15:00');
    });
});

describe('getTimeslotFromDatetime', () => {
    test('extracts compact timeslot from ISO datetime string', () => {
        expect(getTimeslotFromDatetime('2026-06-28T09:00:00')).toBe('0900');
        expect(getTimeslotFromDatetime('2026-06-28T21:30:00')).toBe('2130');
    });

    test('returns empty string for missing datetime', () => {
        expect(getTimeslotFromDatetime('')).toBe('');
        expect(getTimeslotFromDatetime(null)).toBe('');
    });
});

describe('getDateFromDatetime', () => {
    test('extracts YYYY-MM-DD from ISO datetime string', () => {
        expect(getDateFromDatetime('2026-06-28T09:00:00')).toBe('2026-06-28');
    });
});

describe('formatTimeslot', () => {
    test('formats morning, afternoon, and midnight-edge times', () => {
        expect(formatTimeslot('2026-06-28T09:00:00')).toBe('9:00 am');
        expect(formatTimeslot('2026-06-28T12:00:00')).toBe('12:00 pm');
        expect(formatTimeslot('2026-06-28T21:30:00')).toBe('9:30 pm');
    });

    test('returns empty string for missing datetime', () => {
        expect(formatTimeslot('')).toBe('');
    });
});
