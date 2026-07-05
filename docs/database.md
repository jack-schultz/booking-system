# Database (PowerSync)

Local-first SQLite in the browser via [PowerSync Web](https://docs.powersync.com/client-sdk-references/js-web), synced to Supabase Postgres when online.

## Requirements

PowerSync Web requires a dev server that bundles **web workers** and **WASM** files. A plain static server (`python -m http.server`, `npx serve`, or opening HTML files directly) will cause `db.init()` to hang indefinitely.

Always use Vite for development:

```bash
npm run dev
```

See [Getting started](./getting-started.md) for full setup.

## Usage

```javascript
import { initDatabase, ensureSyncConnected } from './db/index.js';

const db = await initDatabase();
// Read/write local SQLite immediately; connect sync without blocking the UI:
void ensureSyncConnected(db);
```

Booking pages open the local DB with `initDatabase()`, render from SQLite, then call `ensureSyncConnected()` without awaiting it so a slow or hanging `db.connect()` does not block the UI.

`initDatabaseAndSync()` is still available when you need to open the DB and wait for sync in one step (e.g. some booking forms).

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
├── bookings.js          # Booking CRUD and datetime helpers
├── migrate.js           # db.init() + migration runner
└── migrations/          # Named migration hooks
```

## Sync lifecycle

| Function | When |
|----------|------|
| `initDatabase()` | Open local SQLite + run migrations |
| `initDatabaseAndSync()` | Above + await `connectSync()` if configured and online |
| `ensureSyncConnected(db)` | Start sync when ready; booking manager calls this without `await` |
| `connectSync(db)` | Start PowerSync stream (requires session + restaurant) |
| `reconnectSync(db)` | Disconnect then connect (account switch, online, token refresh) |
| `disconnectSync(db)` | Stop sync (last account logout) |

When connected, PowerSync:

1. **Downloads** bookings for the user's restaurant (Sync Streams).
2. **Uploads** local CRUD via `uploadData()` in [`db/supabaseConnector.js`](../db/supabaseConnector.js).

When offline, reads and writes use local SQLite only. The upload queue drains automatically on reconnect.

### Page load order (manager)

The manager page follows an offline-first load sequence:

1. `initDatabase()` — open local SQLite (do not block on sync).
2. `initAccountSwitcher()` — auth and profile cache.
3. `subscribeBookings()` — `db.query(...).watch()` renders from local data immediately.
4. `void ensureSyncConnected(db)` — PowerSync connects in the background; `onData` fires again when remote rows arrive.

Login only runs steps 1 and profile registration, then redirects — it does not call `connectSync()`.

### DB singleton and init

[`openDB.js`](../db/openDB.js) stores the `PowerSyncDatabase` instance on `globalThis` so Vite hot module reload does not create a second instance that deadlocks on IndexedDB / navigator locks.

[`initDatabase()`](../db/index.js) uses a shared promise so concurrent callers (e.g. login and a booking page) wait on a single `db.init()` instead of racing.

See [PowerSync + Supabase sync](./powersync-supabase.md) for dashboard setup and Sync Streams configuration.

## Sync status UI

The app exposes sync **status** (connection health, queue, errors) separately from sync **control** ([`db/sync.js`](../db/sync.js)).

| File | Role |
|------|------|
| [`db/syncStatus.js`](../db/syncStatus.js) | `computeSyncHealth()`, `getSyncSnapshot()`, `subscribeSyncStatus()`, issue log |
| [`ui/syncIndicator.js`](../ui/syncIndicator.js) | Navbar icon; red / yellow / green from health state |
| [`sync-status.html`](../sync-status.html) | Full dashboard — metrics, upload queue, download activity, reconnect |

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
    deleteBooking,
    buildDatetime,
    formatTimeslot,
} from './db/bookings.js';

const db = await initDatabaseAndSync();
const today = new Date();
const bookings = await getBookingsForDate(db, today, restaurantId);
```

All list/get/update/delete helpers include `restaurant_id` in their WHERE clauses.

## Watched queries (live UI)

The manager page uses a watched query so the list updates when local data changes — including remote sync from other devices. The list renders as soon as local SQLite is ready; sync does not need to be connected first.

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
            // ...
        },
        {
            indexes: {
                idx_bookings_restaurant_id: ['restaurant_id'],
                idx_bookings_datetime: ['datetime'],
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

Supabase Postgres schema lives in [`supabase/migrations/`](../supabase/migrations/) and must stay aligned with `db/schema.js`.

## Vite configuration

`vite.config.js` excludes `@powersync/web` from dependency pre-bundling:

```javascript
optimizeDeps: {
    exclude: ['@powersync/web'],
},
worker: {
    format: 'es',
},
```

This is required for worker and WASM loading. Do not remove it.

## Clearing local data

PowerSync stores data in IndexedDB (via WA-SQLite's default VFS). To reset during development:

- Chrome DevTools → Application → IndexedDB → delete the database files, or
- Use an incognito window

If the manager stays on "Loading..." after a code change during `npm run dev`, hard-refresh the page — a stale HMR reload can leave a half-initialized DB instance until you refresh.

## Related docs

- [Architecture](./architecture.md) — how the DB fits with auth and booking pages
- [Authentication](./authentication.md) — login initializes the local DB; sync connects on booking pages
- [PowerSync + Supabase sync](./powersync-supabase.md) — cloud setup and security
