# Database (PowerSync)

Local-first SQLite in the browser via [PowerSync Web](https://docs.powersync.com/client-sdk-references/js-web), synced to Supabase Postgres when online.

## Requirements

PowerSync Web requires a dev server that bundles **web workers** and **WASM** files. A plain static server (`python -m http.server`, `npx serve`, or opening HTML files directly) will cause `db.init()` to hang indefinitely.

Always use Vite for development:

```bash
npm run dev
```

See [Getting started](./getting-started.html) for full setup.

## Usage

```javascript
import { initDatabase, ensureSyncConnected } from './db/index.js';

const db = await initDatabase();
// Read/write local SQLite immediately; connect sync without blocking the UI:
void ensureSyncConnected(db);
```

Booking pages open the local DB with `initDatabase()`, render from SQLite, then call `ensureSyncConnected()` without awaiting it so a slow or hanging `db.connect()` does not block the UI.

The booking sidebar shell ([`booking/bootstrap.js`](../booking/bootstrap.js)) uses this pattern. Individual view modules receive the shared `db` instance from bootstrap — they do not call `initDatabase()` again on sidebar navigation.

`initDatabaseAndSync()` is still available when you need to open the DB and wait for sync in one step (e.g. legacy call sites). The booking shell and metrics page prefer non-blocking sync.

For local-only dev without PowerSync Cloud, use `initDatabase()` only — no `connectSync`.

## File structure

```
db/
├── schema.js            # AppSchema — tables, columns, indexes
├── openDB.js            # PowerSyncDatabase singleton
├── index.js             # initDatabase(), initDatabaseAndSync()
├── supabaseConnector.js # fetchCredentials + uploadData
├── sync.js              # connectSync, disconnectSync, reconnectSync
├── syncStatus.js        # Sync status health, snapshots, issue log (UI dashboard)
├── bookings.js          # Booking CRUD, datetime helpers, pax aggregation, status helpers
├── bookings.test.js     # Jest tests for bookings.js and meal-period logic
├── tables.js            # Restaurant table lookup and select helpers
├── tables.test.js       # Jest tests for tables.js
├── migrate.js           # db.init() + migration runner
└── migrations/          # Named migration hooks
```

## Sync lifecycle

| Function | When |
|----------|------|
| `initDatabase()` | Open local SQLite + run migrations |
| `initDatabaseAndSync()` | Above + await `connectSync()` if configured and online |
| `ensureSyncConnected(db)` | Start sync when ready; booking shell calls this without `await` |
| `connectSync(db)` | Start PowerSync stream (requires session + restaurant) |
| `reconnectSync(db)` | Disconnect then connect (account switch, online, token refresh) |
| `disconnectSync(db)` | Stop sync (last account logout) |

When connected, PowerSync:

1. **Downloads** bookings for the user's restaurant (Sync Streams).
2. **Uploads** local CRUD via `uploadData()` in [`db/supabaseConnector.js`](../db/supabaseConnector.js).

When offline, reads and writes use local SQLite only. The upload queue drains automatically on reconnect.

### Page load order (booking shell)

The booking sidebar shell ([`booking/bootstrap.js`](../booking/bootstrap.js)) follows an offline-first load sequence once per session:

1. Mount navbar, footer, sidebar (chrome appears immediately).
2. `initAccountSwitcher()` — auth and profile cache (Supabase profile fetch may be skipped if fresh; see [Authentication](./authentication.html)).
3. `initDatabase()` — open local SQLite (do not block on sync).
4. `void ensureSyncConnected(db)` — PowerSync connects in the background.
5. Router mounts the initial view (`managerView`, `createView`, or `walkinView`).
6. Manager view: `subscribeBookings()` — `db.query(...).watch()` renders from local data immediately; `onData` fires again when remote rows arrive.

Sidebar navigation between manager, create, and walk-in **does not repeat steps 1–4** — only the active view unmounts and the next view mounts.

Login only caches the session and profile, then redirects — it does not call `initDatabase()` or `connectSync()`.

### DB singleton and init

[`openDB.js`](../db/openDB.js) stores the `PowerSyncDatabase` instance on `globalThis` so Vite hot module reload does not create a second instance that deadlocks on IndexedDB / navigator locks.

[`initDatabase()`](../db/index.js) uses a shared promise so concurrent callers (e.g. login and a booking page) wait on a single `db.init()` instead of racing.

See [PowerSync + Supabase sync](./powersync-supabase.html) for dashboard setup and Sync Streams configuration.

## Sync status UI

The app exposes sync **status** (connection health, queue, errors) separately from sync **control** ([`db/sync.js`](../db/sync.js)).

| File | Role |
|------|------|
| [`db/syncStatus.js`](../db/syncStatus.js) | `computeSyncHealth()`, `getSyncSnapshot()`, `subscribeSyncStatus()`, issue log |
| [`ui/syncIndicator.js`](../ui/syncIndicator.js) | Navbar icon; red / yellow / green from health state |
| `/booking/sync-status` (SPA view) | Full dashboard — upload queue, download activity, reconnect |

The status module reads PowerSync SDK APIs (`currentStatus`, `registerListener`, `getUploadQueueStats`, `getCrudBatch`) and combines them with `navigator.onLine` and account/restaurant checks. Upload failures recorded in [`db/supabaseConnector.js`](../db/supabaseConnector.js) appear in the issue log.

There is no client-side conflict resolution UI — Postgres uses last-write-wins.

## Booking helpers (`bookings.js`)

The booking pages do not run raw SQL inline. They import helpers from `db/bookings.js`:

```javascript
import {
    getBookingsForDate,
    getBookingById,
    insertBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    buildDatetime,
    formatTimeslot,
    toTimestamptz,
    aggregateBookingsByDay,
    aggregateBookingsByWeek,
    getWeekRange,
} from './db/bookings.js';

const db = await initDatabase();
void ensureSyncConnected(db);
const today = new Date();
const bookings = await getBookingsForDate(db, today, restaurantId);
```

All list/get/update/delete helpers include `restaurant_id` in their WHERE clauses.

### Datetime helpers

| Function | Purpose |
|----------|---------|
| `toTimestamptz(date)` | Serialize a `Date` to ISO 8601 UTC (`…Z`) for SQLite storage |
| `fromTimestamptz(value)` | Parse timestamptz text back to a `Date` (or `null`) |
| `buildDatetime(dateStr, timeslot)` | Combine `YYYY-MM-DD` and compact `HHMM` into timestamptz |
| `getTimeslotFromDatetime(datetime)` | Extract compact `HHMM` for form fields |
| `getDateFromDatetime(datetime)` | Extract local `YYYY-MM-DD` for form fields |
| `formatTimeslot(datetime)` | Display time (e.g. `"9:00 am"`) |

### Status helpers

Bookings cycle through `pending` → `set` → `seated` → `pending` when the status button is clicked in the manager view:

| Function | Purpose |
|----------|---------|
| `getNextBookingStatus(status)` | Next status in the cycle |
| `getBookingStatusLabel(status)` | Display label (`Unset`, `Set`, `Seated`) |
| `getBookingStatusClass(status)` | CSS class for the status button |
| `updateBookingStatus(db, id, restaurantId, status)` | Persist a status change |

Status values are defined in [`config/constants.js`](../config/constants.js) as `BOOKING_STATUS`.

### Pax aggregation

Pax totals sum `total_pax`, `adult_pax`, `child_pax`, and `hc_pax` across bookings. Lunch vs dinner is determined by [`config/timeslots.js`](../config/timeslots.js) — bookings at or after 5:00 PM (`1700`) count as dinner.

| Function | Purpose |
|----------|---------|
| `createEmptyPaxTotals()` | Zeroed pax object |
| `addPaxTotals(target, source)` | Add pax fields in place |
| `aggregateBookingsByDay(bookings)` | Lunch, dinner, and day totals for one calendar day |
| `getWeekRange(anchorDate, weekOffset)` | Monday 00:00 through next Monday 00:00 |
| `aggregateBookingsByWeek(bookings, weekStart)` | Per-day lunch/dinner totals plus week and weekend summaries |

The manager view shows per-timeslot pax totals in each timeslot heading and lunch/dinner/day totals at the bottom. The metrics page uses `aggregateBookingsByWeek` for a tabular week view.

Run `npm test` to execute [`db/bookings.test.js`](../db/bookings.test.js).

## Table helpers (`tables.js`)

Restaurant seating tables are stored in `public.tables`, synced into local SQLite via PowerSync, and read offline from the local `tables` table. Staff manage tables on `/booking/tables` (app navbar link). The create/edit booking form loads options from local SQLite:

```javascript
import { getTablesForRestaurant, populateTableSelect } from './db/tables.js';

const tables = await getTablesForRestaurant(db, restaurantId);
populateTableSelect(document.getElementById('tableId'), tables);
```

**Offline reads:** PowerSync downloads `tables` via the `restaurant_tables` sync stream (see [PowerSync + Supabase sync](./powersync-supabase.html)). The booking table dropdown and admin list read local SQLite.

**Admin mutations (online only):** Adding, editing, or deleting tables uses Supabase REST because `tables.id` is a server-assigned integer. The UI disables these actions offline; PowerSync syncs changes into local SQLite after online writes.

| Function | Purpose |
|----------|---------|
| `getTablesForRestaurant(db, restaurantId)` | List tables from local SQLite (offline-capable) |
| `loadTablesForRestaurant(db, restaurantId)` | Alias for `getTablesForRestaurant` |
| `insertTableOnline({ restaurant_id, name, pax_max })` | Add table via Supabase REST (online only) |
| `updateTableOnline(id, { name, pax_max }, restaurantId)` | Update via Supabase REST (online only) |
| `deleteTableAndClearBookings(db, id, restaurantId)` | Clear `bookings.table_id`, delete via Supabase REST |
| `getBookingsCountForTable(db, tableId, restaurantId)` | Count bookings assigned to a table (delete warning) |
| `populateTableSelect(select, tables)` | Fill booking form dropdown |
| `formatTableLabel(table)` | Display label with optional max pax |

| Column | Purpose |
|--------|---------|
| `id` | Primary key; stored on `bookings.table_id` when assigned |
| `restaurant_id` | Tenant scope — queries filter by active restaurant |
| `name` | Display label in the dropdown |
| `pax_max` | Optional max party size (nullable in Postgres); shown in label when set |

`bookings.table_id` is nullable — table assignment is optional at create/edit time.

Run `npm test` to execute [`db/tables.test.js`](../db/tables.test.js).

## Watched queries (live UI)

The manager view ([`booking/views/managerView.js`](../booking/views/managerView.js)) uses a watched query so the list updates when local data changes — including remote sync from other devices. The list renders as soon as local SQLite is ready; sync does not need to be connected first. Leaving the manager view calls `activeWatch.close()` so listeners do not leak.

The metrics page uses the same pattern over a week range (`getWeekRange` + `toTimestamptz` bounds).

The tables admin view ([`booking/views/tablesView.js`](../booking/views/tablesView.js)) uses the same watched-query pattern over local `tables`.

```javascript
const watched = db.query({
    sql: `SELECT * FROM bookings WHERE restaurant_id = ? AND datetime >= ? AND datetime < ? ORDER BY datetime, last_name`,
    parameters: [restaurantId, start, end],
}).watch();

watched.registerListener({
    onData: (bookings) => renderBookings(bookings),
});

// When changing date or account:
await watched.close();
```

**API note:** `onResult` is only valid on the lower-level `db.watch(sql, params, { onResult })` API. For `db.query(...).watch()`, you must call `.watch()` with no callback, then `registerListener({ onData })`.

## Schema

Define tables in `db/schema.js` using the `column` helper:

```javascript
import { Schema, Table, column } from '@powersync/web';

export const AppSchema = new Schema({
    bookings: new Table(
        {
            id: column.text,
            created_at: column.text,
            restaurant_id: column.integer,
            table_id: column.integer,
            // ...
        },
        {
            indexes: {
                idx_bookings_restaurant_id: ['restaurant_id'],
                idx_bookings_datetime: ['datetime'],
                idx_bookings_table_id: ['table_id'],
            },
        }
    ),
    tables: new Table(
        {
            id: column.integer,
            created_at: column.text,
            restaurant_id: column.integer,
            pax_max: column.integer,
            name: column.text,
        },
        {
            indexes: {
                idx_tables_restaurant_id: ['restaurant_id'],
            },
        }
    ),
});
```

PowerSync applies the schema automatically on `db.init()`.

### Local-only tables

Tables that should never sync to Supabase (e.g. migration tracking):

```javascript
migrations: new Table(
    { name: column.text, applied_at: column.text },
    { localOnly: true }
),
```

## Migrations

`migrate.js` runs after `db.init()`:

1. Reads applied migration names from the `migrations` table.
2. Runs any pending entries in `db/migrations/index.js`.
3. Records each applied migration.

Most migrations are currently no-ops because schema changes belong in `schema.js`. Use migrations for one-time data backfills or raw SQL that cannot be expressed declaratively.

Supabase Postgres schema lives in [`supabase/migrations/`](../supabase/migrations/) and must stay aligned with `db/schema.js`:

| Migration | Contents |
|-----------|----------|
| `001_initial.sql` | `restaurants`, `profiles`, `bookings`, RLS |
| `002_tables.sql` | `tables` (seating), select-only RLS |
| `003_bookings_table_id.sql` | `bookings.table_id` FK to `tables` |
| `004_tables_write_rls.sql` | `tables` insert/update/delete RLS for admin page |

## Vite configuration

`vite.config.js` excludes `@powersync/web` from dependency pre-bundling and registers the PWA plugin:

```javascript
optimizeDeps: {
    exclude: ['@powersync/web'],
},
worker: {
    format: 'es',
},
plugins: [
    VitePWA({
        registerType: 'autoUpdate',
        workbox: { navigateFallback: null },
        // ...
    }),
],
```

This is required for worker and WASM loading. Do not remove the `optimizeDeps` or `worker` settings.

## Clearing local data

PowerSync stores data in IndexedDB (via WA-SQLite's default VFS). To reset during development:

- Chrome DevTools → Application → IndexedDB → delete the database files, or
- Use an incognito window

If the manager stays on "Loading..." after a code change during `npm run dev`, hard-refresh the page — a stale HMR reload can leave a half-initialized DB instance until you refresh.

## Related docs

- [Architecture](./architecture.html) — how the DB fits with auth and booking pages
- [Authentication](./authentication.html) — login redirects to the booking shell; sync connects there
- [PowerSync + Supabase sync](./powersync-supabase.html) — cloud setup and security
