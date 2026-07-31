import {
    buildDatetime,
    getBookingById,
    getBookingsInRange,
    getDateFromDatetime,
    getTimeslotFromDatetime,
    insertBooking,
    toTimestamptz,
    updateBooking,
} from '../../db/bookings.js';
import { loadTablesForRestaurant, populateTableSelect } from '../../db/tables.js';
import { BOOKING_STATUS, DEMO_MAX_BOOKINGS } from '../../config/constants.js';
import { populateTimeslotSelect } from '../../config/timeslots.js';
import {
    getActiveProfileId,
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';
import { isDemoAccount } from '../../auth/demoMode.js';
import {
    formatDateKey,
    mountBookingDateBar,
    parseDateKey,
} from '../../ui/bookingDateBar.js';

/** @type {AbortController | null} */
let abortController = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
/** @type {ReturnType<typeof mountBookingDateBar> | null} */
let dateBar = null;
let db = null;
let onNavigate = null;

// Required as the date bar is used in multiple views
const CREATE_DATE_BAR_IDS = {
    dateLeft: 'create-booking-list-date-left',
    dateRight: 'create-booking-list-date-right',
    datePicker: 'create-booking-date-picker',
    dateHeader: 'create-booking-list-header',
    headerPax: 'create-booking-header-pax',
    dateDropdown: 'create-booking-date-dropdown',
    dateDropdownList: 'create-booking-date-dropdown-list',
    dateToday: 'create-booking-date-today',
};

const root = () => document.getElementById('view-create');

function resetForm() {
    const viewRoot = root();
    if (!viewRoot) return;

    const form = viewRoot.querySelector('#bookingForm');
    form.reset();

    const bookingNotice = viewRoot.querySelector('#create-booking-notice');
    const timeslot = viewRoot.querySelector('#timeslot');
    const bookingDate = viewRoot.querySelector('#bookingDate');

    bookingNotice.hidden = true;
    bookingNotice.textContent = '';

    populateTimeslotSelect(timeslot);
    bookingDate.value = formatDateKey(dateBar?.getDate() ?? new Date());

    const tableId = viewRoot.querySelector('#tableId');
    if (tableId) {
        tableId.value = '';
    }

    form.querySelectorAll('input, select, textarea, button').forEach((el) => {
        el.disabled = false;
    });
}

function applyRestaurantGuard() {
    const viewRoot = root();
    if (!viewRoot) return false;

    const form = viewRoot.querySelector('#bookingForm');
    const bookingNotice = viewRoot.querySelector('#create-booking-notice');

    if (hasAssignedRestaurant()) {
        bookingNotice.hidden = true;
        form.querySelectorAll('input, select, textarea, button').forEach((el) => {
            el.disabled = false;
        });
        return true;
    }

    bookingNotice.hidden = false;
    bookingNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant before creating bookings.';
    form.querySelectorAll('input, select, textarea, button').forEach((el) => {
        el.disabled = true;
    });
    return false;
}

async function countRestaurantBookings() {
    if (!db) return 0;

    const restaurantId = getActiveRestaurantId();
    const start = new Date('2000-01-01');
    const end = new Date('2100-01-01');
    const bookings = await getBookingsInRange(db, start, end, restaurantId);
    return bookings.length;
}

async function applyDemoLimitGuard(state) {
    const viewRoot = root();
    if (!viewRoot || !isDemoAccount() || state.editingId) return true;

    const form = viewRoot.querySelector('#bookingForm');
    const bookingNotice = viewRoot.querySelector('#create-booking-notice');
    const atLimit = (await countRestaurantBookings()) >= DEMO_MAX_BOOKINGS;

    if (!atLimit) {
        if (hasAssignedRestaurant()) {
            bookingNotice.hidden = true;
            bookingNotice.textContent = '';
            form.querySelectorAll('input, select, textarea, button').forEach((el) => {
                el.disabled = false;
            });
        }
        return true;
    }

    bookingNotice.hidden = false;
    bookingNotice.textContent =
        `Demo limit reached — maximum ${DEMO_MAX_BOOKINGS} bookings. Delete a booking or sign up for a real account to continue.`;
    form.querySelectorAll('input, select, textarea, button').forEach((el) => {
        el.disabled = true;
    });
    return false;
}

async function loadTables() {
    const viewRoot = root();
    if (!viewRoot || !db) return;

    const tableSelect = viewRoot.querySelector('#tableId');
    if (!tableSelect) return;

    if (!hasAssignedRestaurant()) {
        populateTableSelect(tableSelect, []);
        return;
    }

    const restaurantId = getActiveRestaurantId();
    const tables = await loadTablesForRestaurant(db, restaurantId);
    populateTableSelect(tableSelect, tables);
}

async function loadBookingForEdit(editId, state) {
    const viewRoot = root();
    if (!viewRoot) return;

    const bookingDate = viewRoot.querySelector('#bookingDate');
    const timeslot = viewRoot.querySelector('#timeslot');
    const firstName = viewRoot.querySelector('#firstName');
    const lastName = viewRoot.querySelector('#lastName');
    const phoneNumber = viewRoot.querySelector('#phoneNumber');
    const email = viewRoot.querySelector('#email');
    const totalPax = viewRoot.querySelector('#totalPax');
    const adultPax = viewRoot.querySelector('#adultPax');
    const childPax = viewRoot.querySelector('#childPax');
    const hcPax = viewRoot.querySelector('#hcPax');
    const preference = viewRoot.querySelector('#preference');
    const tableId = viewRoot.querySelector('#tableId');
    const additionalDetails = viewRoot.querySelector('#additionalDetails');

    const restaurantId = getActiveRestaurantId();
    const booking = await getBookingById(db, editId, restaurantId);
    if (!booking) {
        onNavigate?.('manager', { replace: true });
        return;
    }

    state.editingId = editId;
    state.editingStatus = booking.status;
    bookingDate.value = getDateFromDatetime(booking.datetime);
    dateBar?.setDate(parseDateKey(bookingDate.value) ?? new Date(), { silent: true });
    timeslot.value = getTimeslotFromDatetime(booking.datetime);
    firstName.value = booking.first_name;
    lastName.value = booking.last_name;
    phoneNumber.value = booking.phone_number ?? '';
    email.value = booking.email ?? '';
    totalPax.value = booking.total_pax;
    adultPax.value = booking.adult_pax;
    childPax.value = booking.child_pax;
    hcPax.value = booking.hc_pax;
    preference.value = booking.preference ?? 'none';
    if (tableId) {
        tableId.value = booking.table_id != null ? String(booking.table_id) : '';
    }
    additionalDetails.value = booking.notes ?? '';
}

function updatePax(viewRoot) {
    const totalPax = viewRoot.querySelector('#totalPax');
    const childPax = viewRoot.querySelector('#childPax');
    const hcPax = viewRoot.querySelector('#hcPax');
    const adultPax = viewRoot.querySelector('#adultPax');

    const total = parseInt(totalPax.value, 10) || 0;
    const children = parseInt(childPax.value, 10) || 0;
    const hc = parseInt(hcPax.value, 10) || 0;
    let adults = total - children - hc;
    if (adults < 0) adults = 0;
    adultPax.value = adults;
}

/**
 * @param {{ db: import('@powersync/web').PowerSyncDatabase, onNavigate: Function, registerOnAccountSwitch: Function, editId?: string | null }} ctx
 */
export async function mountCreateView(ctx) {
    db = ctx.db;
    onNavigate = ctx.onNavigate;
    abortController = new AbortController();
    const { signal } = abortController;

    const viewRoot = root();
    if (!viewRoot) return;

    const form = viewRoot.querySelector('#bookingForm');
    const timeslot = viewRoot.querySelector('#timeslot');
    const totalPax = viewRoot.querySelector('#totalPax');
    const childPax = viewRoot.querySelector('#childPax');
    const hcPax = viewRoot.querySelector('#hcPax');
    const bookingDate = viewRoot.querySelector('#bookingDate');

    const state = {
        editingId: null,
        editingStatus: BOOKING_STATUS.PENDING,
    };

    let syncingDate = false;

    dateBar = mountBookingDateBar({
        viewRoot,
        db,
        signal,
        ids: CREATE_DATE_BAR_IDS,
        onDateChange: (date) => {
            if (syncingDate) return;
            syncingDate = true;
            bookingDate.value = formatDateKey(date);
            syncingDate = false;
        },
    });

    resetForm();

    bookingDate.addEventListener('change', () => {
        if (syncingDate) return;
        const parsed = parseDateKey(bookingDate.value);
        if (!parsed) return;
        syncingDate = true;
        dateBar?.setDate(parsed, { silent: true });
        syncingDate = false;
    }, { signal });

    const onPaxChange = () => updatePax(viewRoot);
    totalPax.addEventListener('change', onPaxChange, { signal });
    childPax.addEventListener('change', onPaxChange, { signal });
    hcPax.addEventListener('change', onPaxChange, { signal });

    unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
        applyRestaurantGuard();
        dateBar?.refresh();
        void loadTables();
    });

    window.addEventListener('online', () => {
        if (hasAssignedRestaurant()) {
            void loadTables();
        }
    }, { signal });

    if (applyRestaurantGuard()) {
        await loadTables();
        if (ctx.editId) {
            await loadBookingForEdit(ctx.editId, state);
        } else {
            await applyDemoLimitGuard(state);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!hasAssignedRestaurant()) {
            return;
        }

        if (!state.editingId && isDemoAccount()) {
            const atLimit = (await countRestaurantBookings()) >= DEMO_MAX_BOOKINGS;
            if (atLimit) {
                const bookingNotice = viewRoot.querySelector('#create-booking-notice');
                bookingNotice.hidden = false;
                bookingNotice.textContent =
                    `Demo limit reached. Maximum ${DEMO_MAX_BOOKINGS} bookings. Delete a booking or sign up for a real account to continue.`;
                return;
            }
        }

        const bookingDateEl = viewRoot.querySelector('#bookingDate');
        const timeslotEl = viewRoot.querySelector('#timeslot');
        const firstName = viewRoot.querySelector('#firstName');
        const lastName = viewRoot.querySelector('#lastName');
        const phoneNumber = viewRoot.querySelector('#phoneNumber');
        const email = viewRoot.querySelector('#email');
        const totalPaxEl = viewRoot.querySelector('#totalPax');
        const adultPax = viewRoot.querySelector('#adultPax');
        const childPaxEl = viewRoot.querySelector('#childPax');
        const hcPaxEl = viewRoot.querySelector('#hcPax');
        const preference = viewRoot.querySelector('#preference');
        const tableIdEl = viewRoot.querySelector('#tableId');
        const additionalDetails = viewRoot.querySelector('#additionalDetails');

        const tableIdValue = tableIdEl?.value ?? '';
        const table_id = tableIdValue === '' ? null : parseInt(tableIdValue, 10);

        const record = {
            first_name: firstName.value,
            last_name: lastName.value,
            phone_number: phoneNumber.value,
            email: email.value,
            total_pax: parseInt(totalPaxEl.value, 10),
            adult_pax: parseInt(adultPax.value, 10),
            child_pax: parseInt(childPaxEl.value, 10),
            hc_pax: parseInt(hcPaxEl.value, 10),
            preference: preference.value,
            notes: additionalDetails.value,
            datetime: buildDatetime(bookingDateEl.value, timeslotEl.value),
            status: state.editingId ? state.editingStatus : BOOKING_STATUS.PENDING,
            table_id,
        };

        if (state.editingId) {
            await updateBooking(db, state.editingId, record, getActiveRestaurantId());
        } else {
            await insertBooking(db, {
                ...record,
                profile_id: getActiveProfileId(),
                restaurant_id: getActiveRestaurantId(),
                id: crypto.randomUUID(),
                created_at: toTimestamptz(new Date()),
            });
        }

        onNavigate?.('manager');
    }, { signal });
}

export async function unmountCreateView() {
    await dateBar?.destroy();
    dateBar = null;

    abortController?.abort();
    abortController = null;
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;
    db = null;
    onNavigate = null;
}
