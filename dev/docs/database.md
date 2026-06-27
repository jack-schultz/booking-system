# Database (PowerSync)

Local-first SQLite in the browser via [PowerSync Web](https://docs.powersync.com/client-sdk-references/js-web).

## Requirements

PowerSync Web requires a dev server that bundles **web workers** and **WASM** files. A plain static server (`python -m http.server`, `npx serve`, or opening HTML files directly) will cause `db.init()` to hang indefinitely.

Always use Vite for development:

```bash
npm run dev
```

See [Getting started](./getting-started.md) for full setup.

## Usage

```javascript
import { initDatabase } from './db/index.js';

const db = await initDatabase();
await db.get('SELECT 1 as ok');
```

`login.html` calls this on page load. Other pages should import the same singleton via `openDB.js` rather than creating new instances.

## File structure

```
db/
├── schema.js       # AppSchema — tables, columns, indexes
├── openDB.js       # PowerSyncDatabase singleton
├── index.js        # initDatabase()
├── bookings.js     # Booking CRUD and datetime helpers
├── migrate.js      # db.init() + migration runner
└── migrations/     # Named migration hooks
```

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

const db = await initDatabase();
const today = new Date().toISOString().split('T')[0];
const bookings = await getBookingsForDate(db, today);
```

`buildDatetime(dateStr, timeslot)` converts a date (`YYYY-MM-DD`) and timeslot (`HHMM`, e.g. `1900`) into an ISO datetime string stored in the `datetime` column.

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
            first_name: column.text,
            last_name: column.text,
            phone_number: column.text,
            email: column.text,
            total_pax: column.integer,
            adult_pax: column.integer,
            child_pax: column.integer,
            hc_pax: column.integer,
            preference: column.text,
            datetime: column.text,
            profile_id: column.text,
            status: column.text,
            notes: column.text,
        },
        {
            indexes: {
                idx_bookings_datetime: ['datetime'],
            },
        }
    ),
});
```

PowerSync expects `{ type: ColumnType.TEXT }` objects using `column.text`.

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

## Local-only vs sync (phases)

| Phase | API | Description |
|-------|-----|-------------|
| **Now** | `initDatabase()` | Local SQLite only; no network sync |
| **Later** | `db.connect(connector)` | Stream data from Supabase via PowerSync Cloud |

See [PowerSync + Supabase roadmap](./powersync-supabase.md) for the full sync plan.

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

## Related docs

- [Architecture](./architecture.md) — how the DB fits with auth and booking pages
- [Authentication](./authentication.md) — login initializes the DB
