import {
    aggregateBookingsByWeek,
    getWeekRange,
    toTimestamptz,
} from '../../db/bookings.js';
import {
    getActiveRestaurantId,
    hasAssignedRestaurant,
} from '../../auth/accountSwitcher.js';
import { formatMetricsPaxCell } from '../../ui/paxSummary.js';

/** @type {AbortController | null} */
let abortController = null;
/** @type {import('@powersync/web').SyncStreamSubscription | null} */
let activeWatch = null;
/** @type {(() => void) | null} */
let unregisterAccountSwitch = null;
/** @type {import('@powersync/web').PowerSyncDatabase | null} */
let db = null;

let weekOffset = 0;

const root = () => document.getElementById('view-metrics');

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

function isSameCalendarDay(left, right) {
    return (
        left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate()
    );
}

function renderMetrics(bookings, weekStart, weekEnd) {
    const metricsHeader = root()?.querySelector('#metrics-header');
    const metricsTable = root()?.querySelector('#metrics-table');
    if (!metricsHeader || !metricsTable) return;

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
                <td>${formatMetricsPaxCell(day.lunch)}</td>
                <td>${formatMetricsPaxCell(day.dinner)}</td>
                <td>${formatMetricsPaxCell(day.dayTotal)}</td>
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
                    <td>${formatMetricsPaxCell(lunchTotal)}</td>
                    <td>${formatMetricsPaxCell(dinnerTotal)}</td>
                    <td>${formatMetricsPaxCell(weekTotal)}</td>
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
                    <td>${formatMetricsPaxCell(weekendTotal)}</td>
                </tr>
                <tr class="metrics-row--summary">
                    <th scope="row">Week total</th>
                    <td>${formatMetricsPaxCell(weekTotal)}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function showUnassignedNotice() {
    const metricsNotice = root()?.querySelector('#metrics-notice');
    const metricsTable = root()?.querySelector('#metrics-table');
    const metricsHeader = root()?.querySelector('#metrics-header');
    if (!metricsNotice || !metricsTable || !metricsHeader) return;

    metricsNotice.hidden = false;
    metricsNotice.textContent =
        'Your account is not assigned to a restaurant yet. Ask an administrator to set your restaurant, then refresh this page.';
    metricsTable.innerHTML = '';
    metricsHeader.textContent = 'Metrics unavailable';
}

async function subscribeBookings() {
    if (!db) return;

    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    const metricsNotice = root()?.querySelector('#metrics-notice');
    if (!hasAssignedRestaurant()) {
        showUnassignedNotice();
        return;
    }

    if (metricsNotice) {
        metricsNotice.hidden = true;
    }

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

/**
 * @param {{ db: import('@powersync/web').PowerSyncDatabase, registerOnAccountSwitch: Function }} ctx
 */
export async function mountMetricsView(ctx) {
    db = ctx.db;
    abortController = new AbortController();
    const { signal } = abortController;

    weekOffset = 0;

    root()?.querySelector('#metrics-week-left')?.addEventListener('click', () => {
        weekOffset -= 1;
        void subscribeBookings();
    }, { signal });

    root()?.querySelector('#metrics-week-right')?.addEventListener('click', () => {
        weekOffset += 1;
        void subscribeBookings();
    }, { signal });

    unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
        void subscribeBookings();
    });

    await subscribeBookings();
}

export async function unmountMetricsView() {
    unregisterAccountSwitch?.();
    unregisterAccountSwitch = null;

    if (activeWatch) {
        await activeWatch.close();
        activeWatch = null;
    }

    abortController?.abort();
    abortController = null;
    db = null;
    weekOffset = 0;
}
