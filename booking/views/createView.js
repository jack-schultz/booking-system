import {
    buildDatetime,
    getBookingById,
    getDateFromDatetime,
    getTimeslotFromDatetime,
    insertBooking,
    toTimestamptz,
    updateBooking,
} from '../../db/bookings.js';
import { loadTablesForRestaurant, populateTableSelect } from '../../db/tables.js';
import { BOOKING_STATUS } from '../../config/constants.js';
import { populateTimeslotSelect } from '../../config/timeslots.js';
import {
    getActiveProfileId,
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';

/** @type {AbortController | null} */
let abortController = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
let db = null;
let onNavigate = null;

const root = () => document.getElementById('view-create');

function resetForm() {
    const viewRoot = root();
    if (!viewRoot) return;

    const form = viewRoot.querySelector('#bookingForm');
    form.reset();

    const pageTitle = viewRoot.querySelector('#pageTitle');
    const bookingNotice = viewRoot.querySelector('#create-booking-notice');
    const timeslot = viewRoot.querySelector('#timeslot');
    const bookingDate = viewRoot.querySelector('#bookingDate');

    pageTitle.textContent = 'New Booking';
    bookingNotice.hidden = true;
    bookingNotice.textContent = '';

    populateTimeslotSelect(timeslot);
    bookingDate.value = getDateFromDatetime(Date());

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

    const pageTitle = viewRoot.querySelector('#pageTitle');
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

    pageTitle.textContent = 'Loading booking…';

    const restaurantId = getActiveRestaurantId();
    const booking = await getBookingById(db, editId, restaurantId);
    if (!booking) {
        onNavigate?.('manager', { replace: true });
        return;
    }

    state.editingId = editId;
    state.editingStatus = booking.status;
    pageTitle.textContent = 'Edit Booking';
    bookingDate.value = getDateFromDatetime(booking.datetime);
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

    const state = {
        editingId: null,
        editingStatus: BOOKING_STATUS.PENDING,
    };

    resetForm();

    const onPaxChange = () => updatePax(viewRoot);
    totalPax.addEventListener('change', onPaxChange, { signal });
    childPax.addEventListener('change', onPaxChange, { signal });
    hcPax.addEventListener('change', onPaxChange, { signal });

    unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
        applyRestaurantGuard();
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
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!hasAssignedRestaurant()) {
            return;
        }

        const bookingDate = viewRoot.querySelector('#bookingDate');
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
            datetime: buildDatetime(bookingDate.value, timeslotEl.value),
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
    abortController?.abort();
    abortController = null;
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;
    db = null;
    onNavigate = null;
}
