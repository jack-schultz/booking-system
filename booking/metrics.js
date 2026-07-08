import '../pwa/register.js';
import { initDatabase, ensureSyncConnected } from '../db/index.js';
import {
    aggregateBookingsByWeek,
    getWeekRange,
    toTimestamptz,
} from '../db/bookings.js';
import {
    initAccountSwitcher,
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../auth/accountSwitcher.js';
import { mountSiteNavbar } from '../ui/navbar.js';
import { mountSiteFooter } from '../ui/footer.js';

mountSiteNavbar(document.getElementById('site-navbar-mount'), {
    basePath: '../',
    showAuthControls: true,
    showSyncIndicator: true,
});
mountSiteFooter(document.getElementById('site-footer-mount'), {
    basePath: '../',
});

const metricsHeader = document.getElementById('metrics-header');
const metricsNotice = document.getElementById('metrics-notice');
const metricsTable = document.getElementById('metrics-table');

const switcherPromise = initAccountSwitcher({
    requireAuth: true,
    loginRedirect: '../login.html',
    onSwitch: () => subscribeBookings(),
});

const db = await initDatabase();

let weekOffset = 0;
let activeWatch = null;

document.getElementById('metrics-week-left').addEventListener('click', () => {
    weekOffset -= 1;
    subscribeBookings();
});
document.getElementById('metrics-week-right').addEventListener('click', () => {
    weekOffset += 1;
    subscribeBookings();
});

function formatWeekLabel(start, end) {
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() - 1);

    const startLabel = start.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    const endLabel = endDate.toLocaleDateString('en-AU', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return `${startLabel} - ${endLabel}`;
}

function formatPaxCell(totals) {
    const { total_pax, adult_pax, child_pax, hc_pax } = totals;
    return `
        <div class="metrics-pax-cell">
            <span class="booking-summary-pax-total">${total_pax}</span>
            <span class="booking-summary-pax-breakdown">
                <span>${adult_pax}A</span>
                <span>${child_pax}C</span>
                <span>${hc_pax}HC</span>
            </span>
        </div>
    `;
}

function isSameCalendarDay(left, right) {
    return (
        left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate()
    );
}

function renderMetrics(bookings, weekStart, weekEnd) {
    metricsHeader.textContent = formatWeekLabel(weekStart, weekEnd);

    const { days, lunchTotal, dinnerTotal, weekendTotal, weekTotal } = aggregateBookingsByWeek(bookings, weekStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayRows = days.map((day) => {
        const rowClass = isSameCalendarDay(day.date, today) ? 'metrics-row--today' : '';
        const dayLabel = day.date.toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
        });

        return `
            <tr class="${rowClass}">
                <th scope="row">${dayLabel}</th>
                <td>${formatPaxCell(day.lunch)}</td>
                <td>${formatPaxCell(day.dinner)}</td>
                <td>${formatPaxCell(day.dayTotal)}</td>
            </tr>
        `;
    }).join('');

    metricsTable.innerHTML = `
        <table class="metrics-table">
            <thead>
                <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Lunch</th>
                    <th scope="col">Dinner</th>
                    <th scope="col">Day total</th>
                </tr>
            </thead>
            <tbody>
                ${dayRows}
            </tbody>
            <tfoot>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${formatPaxCell(lunchTotal)}</td>
                    <td>${formatPaxCell(dinnerTotal)}</td>
                    <td>${formatPaxCell(weekTotal)}</td>
                </tr>
            </tfoot>
        </table>
        <table class="metrics-table metrics-table--summary">
            <thead>
                <tr>
                    <th scope="col">Period</th>
                    <th scope="col">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr class="metrics-row--summary">
                    <th scope="row">Weekend total</th>
                    <td>${formatPaxCell(weekendTotal)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${formatPaxCell(weekTotal)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function showUnassignedNotice() {
    metricsNotice.hidden = false;
    metricsNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    metricsTable.innerHTML = '';
    metricsHeader.textContent = 'Metrics unavailable';
}

async function subscribeBookings() {
    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    metricsNotice.hidden = true;

    const { start, end } = getWeekRange(new Date(), weekOffset);
    const restaurantId = getActiveRestaurantId();

    activeWatch = db
        .query({
            sql: `SELECT * FROM bookings
                  WHERE restaurant_id = ? AND datetime >= ? AND datetime < ?
                  ORDER BY datetime`,
            parameters: [restaurantId, toTimestamptz(start), toTimestamptz(end)],
        })
        .watch();

    activeWatch.registerListener({
        onData: (bookings) => renderMetrics(bookings, start, end),
    });
}

await switcherPromise;
await subscribeBookings();
void ensureSyncConnected(db);
