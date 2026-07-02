import '../pwa/register.js';
import {
    buildDatetime,
    getBookingById,
    getDateFromDatetime,
    getTimeslotFromDatetime,
    insertBooking,
    toTimestamptz,
    updateBooking,
} from '../db/bookings.js';
import { BOOKING_STATUS } from '../config/constants.js';
import { populateTimeslotSelect } from '../config/timeslots.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';
import { mountBookingSidebar } from '../ui/bookingSidebar.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});
mountBookingSidebar(document.getElementById('booking-sidebar-mount'), { showSaveButton: true });

const form = document.querySelector('.booking-form');
const pageTitle = document.getElementById('pageTitle');
const bookingDate = document.getElementById('bookingDate');
const timeslot = document.getElementById('timeslot');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const phoneNumber = document.getElementById('phoneNumber');
const totalPax = document.getElementById('totalPax');
const adultPax = document.getElementById('adultPax');
const childPax = document.getElementById('childPax');
const hcPax = document.getElementById('hcPax');
const preference = document.getElementById('preference');
const email = document.getElementById('email');
const additionalDetails = document.getElementById('additionalDetails');

// Populate static form controls immediately — do not wait on auth or PowerSync init.
populateTimeslotSelect(timeslot);

const editId = new URLSearchParams(window.location.search).get('edit');
let editingId = null;

if (!bookingDate.value) {
    bookingDate.value = new Date().toISOString().split('T')[0];
}

function updatePax() {
    const total = parseInt(totalPax.value, 10) || 0;
    const children = parseInt(childPax.value, 10) || 0;
    const hc = parseInt(hcPax.value, 10) || 0;
    let adults = total - children - hc;
    if (adults < 0) adults = 0;
    adultPax.value = adults;
}

totalPax.addEventListener('change', updatePax);
childPax.addEventListener('change', updatePax);
hcPax.addEventListener('change', updatePax);

const [{ initDatabase }, { initAccountSwitcher, getActiveProfileId, getActiveRestaurantId }] = await Promise.all([
    import('../db/index.js'),
    import('../auth/accountSwitcher.js'),
]);

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
});
const db = await initDatabase();
await switcherPromise;

async function loadBookingForEdit(id) {
    const restaurantId = getActiveRestaurantId();
    const booking = await getBookingById(db, id, restaurantId);
    if (!booking) {
        window.location.href = 'manager.html';
        return;
    }

    editingId = id;
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
    additionalDetails.value = booking.notes ?? '';
}

if (editId) {
    await loadBookingForEdit(editId);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const record = {
        first_name: firstName.value,
        last_name: lastName.value,
        phone_number: phoneNumber.value,
        email: email.value,
        total_pax: parseInt(totalPax.value, 10),
        adult_pax: parseInt(adultPax.value, 10),
        child_pax: parseInt(childPax.value, 10),
        hc_pax: parseInt(hcPax.value, 10),
        preference: preference.value,
        notes: additionalDetails.value,
        datetime: buildDatetime(bookingDate.value, timeslot.value),
        status: BOOKING_STATUS.CONFIRMED,
    };

    if (editingId) {
        await updateBooking(db, editingId, record, getActiveRestaurantId());
    } else {
        await insertBooking(db, {
            ...record,
            profile_id: getActiveProfileId(),
            restaurant_id: getActiveRestaurantId(),
            id: crypto.randomUUID(),
            created_at: toTimestamptz(new Date()),
        });
    }

    window.location.href = 'manager.html';
});
