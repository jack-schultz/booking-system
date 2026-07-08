import '../pwa/register.js';
import { initDatabaseAndSync, ensureSyncConnected } from '../db/index.js';
import { initAccountSwitcher, getActiveProfileId, getActiveRestaurantId, hasAssignedRestaurant } from '../auth/accountSwitcher.js';
import { seedTestBookings, SEED_DEFAULTS } from './seedTestBookings.js';

const statusEl = document.getElementById('seed-status');
const logEl = document.getElementById('seed-log');
const runButton = document.getElementById('run-seed');
const countInput = document.getElementById('booking-count');
const daySpanInput = document.getElementById('day-span');

function setStatus(message) {
    statusEl.textContent = message;
}

function appendLog(message) {
    const line = document.createElement('p');
    line.textContent = message;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
    logEl.innerHTML = '';
}

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
});

const db = await initDatabaseAndSync();
await switcherPromise;
await ensureSyncConnected(db);

if (!hasAssignedRestaurant()) {
    setStatus('Your account is not assigned to a restaurant. Assign one in Supabase before seeding.');
    runButton.disabled = true;
} else {
    const restaurantId = getActiveRestaurantId();
    setStatus(`Ready to seed restaurant #${restaurantId}.`);
}

runButton.addEventListener('click', async () => {
    if (!hasAssignedRestaurant()) {
        return;
    }

    const count = Math.max(1, parseInt(countInput.value, 10) || SEED_DEFAULTS.bookingCount);
    const daySpan = Math.max(1, parseInt(daySpanInput.value, 10) || SEED_DEFAULTS.daySpan);
    const restaurantId = getActiveRestaurantId();
    const profileId = getActiveProfileId();

    runButton.disabled = true;
    clearLog();
    setStatus(`Seeding ${count} bookings across ${daySpan} days…`);

    const startedAt = performance.now();

    try {
        await seedTestBookings(db, {
            count,
            daySpan,
            restaurantId,
            profileId,
            onProgress: (done, total) => {
                if (done === total || done % 25 === 0) {
                    setStatus(`Inserted ${done} / ${total} bookings…`);
                }
            },
        });

        const seconds = ((performance.now() - startedAt) / 1000).toFixed(1);
        setStatus(`Done — inserted ${count} test bookings in ${seconds}s.`);
        appendLog(`Restaurant ID: ${restaurantId}`);
        appendLog(`Date window: ${daySpan} days centered on today`);
        appendLog('Open the booking manager to review seeded data. Changes will sync when online.');
    } catch (error) {
        console.error(error);
        setStatus(`Seed failed: ${error.message ?? error}`);
    } finally {
        runButton.disabled = false;
    }
});
