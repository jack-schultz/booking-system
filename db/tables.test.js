import { formatTableDeleteConfirmMessage, formatTableLabel, populateTableSelect } from './tables.js';

function createMockSelect(initialPlaceholder = true) {
    const children = [];
    const select = {
        set innerHTML(_value) {
            children.length = 0;
        },
        get innerHTML() {
            return '';
        },
        querySelector(selector) {
            if (selector === 'option[value=""]') {
                return children.find((child) => child.value === '') ?? null;
            }
            return null;
        },
        appendChild(element) {
            children.push(element);
        },
        get options() {
            return children;
        },
    };

    if (initialPlaceholder) {
        children.push({ value: '', textContent: 'None', selected: true });
    }

    return select;
}

describe('populateTableSelect', () => {
    beforeEach(() => {
        global.document = {
            createElement() {
                return {
                    value: '',
                    textContent: '',
                    selected: false,
                };
            },
        };
    });

    test('preserves existing None placeholder and appends table options', () => {
        const select = createMockSelect(true);
        populateTableSelect(select, [
            { id: 1, name: 'Table 1', pax_max: 4 },
            { id: 2, name: 'Booth A', pax_max: null },
        ]);

        expect(select.options).toHaveLength(3);
        expect(select.options[0].value).toBe('');
        expect(select.options[0].textContent).toBe('None');
        expect(select.options[1].value).toBe('1');
        expect(select.options[1].textContent).toBe('Table 1 (4 max)');
        expect(select.options[2].value).toBe('2');
        expect(select.options[2].textContent).toBe('Booth A');
    });

    test('creates None placeholder when missing', () => {
        const select = createMockSelect(false);
        populateTableSelect(select, [{ id: 3, name: 'Patio 1', pax_max: 6 }]);

        expect(select.options).toHaveLength(2);
        expect(select.options[0].value).toBe('');
        expect(select.options[0].textContent).toBe('None');
        expect(select.options[1].textContent).toBe('Patio 1 (6 max)');
    });
});

describe('formatTableLabel', () => {
    test('includes max pax when set', () => {
        expect(formatTableLabel({ name: 'Table 1', pax_max: 4 })).toBe('Table 1 (4 max)');
    });

    test('shows name only when pax_max is null', () => {
        expect(formatTableLabel({ name: 'Booth A', pax_max: null })).toBe('Booth A');
    });
});

describe('formatTableDeleteConfirmMessage', () => {
    test('returns simple prompt when no bookings assigned', () => {
        expect(formatTableDeleteConfirmMessage(0)).toBe('Delete this table?');
    });

    test('warns about single assigned booking', () => {
        expect(formatTableDeleteConfirmMessage(1)).toBe(
            'This table is assigned to 1 booking. Deleting it will set those bookings to None. Continue?'
        );
    });

    test('warns about multiple assigned bookings', () => {
        expect(formatTableDeleteConfirmMessage(3)).toBe(
            'This table is assigned to 3 bookings. Deleting it will set those bookings to None. Continue?'
        );
    });
});
