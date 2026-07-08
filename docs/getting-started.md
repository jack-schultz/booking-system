# Getting started

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- A Supabase project (auth + Postgres)
- A PowerSync Cloud instance connected to that Supabase project (for sync; optional for local-only dev)

## Install

```bash
npm install
```

Peer dependency `@journeyapps/wa-sqlite` is listed in `devDependencies` and is required by `@powersync/web`.

## Environment

Copy `.env.example` to `.env` and set:

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Supabase → Project Settings → API Keys |
| `VITE_POWERSYNC_URL` | PowerSync Cloud instance endpoint | PowerSync Dashboard → **Connect** (omit for local-only dev) |

Example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_POWERSYNC_URL=https://xxxxxxxx.powersync.journeyapps.com
```

Restart `npm run dev` after editing `.env`.

## PowerSync + Supabase setup checklist

Complete these steps once per environment (Development or Production instance):

1. **Supabase schema** — Run [`supabase/migrations/001_initial.sql`](../supabase/migrations/001_initial.sql) in the SQL editor.
2. **PowerSync role** — Create `powersync_role`, grants, and `powersync` publication (see [PowerSync + Supabase sync](./powersync-supabase.html)).
3. **Connect PowerSync to Postgres** — PowerSync Dashboard → Database Connections → Supabase **direct** connection URI, username `powersync_role`, database `postgres`, SSL `verify-full`.
4. **Enable Supabase Auth** — PowerSync Dashboard → Client Auth → **Use Supabase Auth**.
5. **Deploy Sync Streams** — Paste the `restaurant_bookings` stream YAML (edition 3) from [PowerSync + Supabase sync](./powersync-supabase.html).
6. **Set `VITE_POWERSYNC_URL`** — PowerSync Dashboard → **Connect** → copy instance URL into `.env`.
7. **Assign a test user** — Create a restaurant and set `profiles.restaurant_id` for your user.

## Supabase database

Run the initial migration in the Supabase SQL editor:

```
supabase/migrations/001_initial.sql
```

Then seed a test restaurant and assign your user:

```sql
insert into public.restaurants (name) values ('Demo Restaurant');
update public.profiles set restaurant_id = 1 where id = '<your-user-uuid>';
```

See [PowerSync + Supabase sync](./powersync-supabase.html) for full schema, RLS, Sync Streams, and troubleshooting.

## Development server

PowerSync Web needs Vite to bundle web workers and WASM. Do **not** use a plain static server for pages that touch the database.

```bash
npm run dev
```

Vite opens http://localhost:5173/login.html by default.

### Other scripts

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build to `dist/` |
| `npm run build:pages` | Production build with GitHub Pages base path (`/booking-system/`) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Jest tests (`db/bookings.test.js`) |

## Project layout

```
booking-system/
├── auth/              # Account switcher, profiles, offline account cache
├── booking/           # Booking manager, metrics, create, walk-in pages
│   ├── manager.js     # Day view with timeslot groups and pax totals
│   └── metrics.js     # Weekly lunch/dinner pax metrics
├── config/            # Shared constants, timeslots, connectivity helpers
│   ├── constants.js   # Booking status values, storage keys
│   └── timeslots.js   # Bookable timeslot options, lunch/dinner cutoff
├── db/                # PowerSync schema, connector, sync, booking helpers
│   ├── supabaseConnector.js
│   ├── sync.js        # connectSync / disconnectSync (database sync)
│   ├── syncStatus.js  # sync status dashboard data + navbar health
│   └── bookings.js    # CRUD, datetime helpers, pax aggregation
├── pwa/               # Service worker registration (vite-plugin-pwa)
│   └── register.js
├── ui/                # Shared navbar, sync indicator, footer, booking sidebar
│   ├── navbar.js
│   ├── paxSummary.js  # Pax breakdown markup for manager and metrics
│   └── syncIndicator.js
├── supabase/
│   └── migrations/    # Postgres schema for Supabase
├── docs/              # Documentation (markdown + HTML shells)
├── login.html         # Login (initializes local DB; sync connects on booking pages)
├── sync-status.html   # Sync status dashboard (auth required)
├── signup.html        # Account creation
├── supabaseClient.js  # Shared Supabase client (ES module)
└── vite.config.js     # Vite + PWA plugin + doc build entries
```

## Typical dev flow

1. Complete the [PowerSync + Supabase setup checklist](#powersync--supabase-setup-checklist) above.
2. Start `npm run dev`.
3. Log in at `/login.html` — Supabase auth and local DB init, then redirect to the manager.
4. Use booking pages under `/booking/` — manager lists bookings from local SQLite immediately and syncs in the background; create saves to local SQLite and uploads when online.
5. Open **Weekly Metrics** from the navbar for lunch/dinner pax totals by day across the current week.
6. Click the **sync status icon** (top-right navbar) to open `/sync-status.html` — pending uploads, download progress, connection state, and issues.

## Troubleshooting

See the full [troubleshooting table](./powersync-supabase.html#troubleshooting) in the PowerSync + Supabase doc. Common issues:

### `db.init()` hangs forever

You are likely serving files without Vite (e.g. `python -m http.server` or opening HTML directly). Use `npm run dev`. See [Database](./database.html).

### Module import errors in the browser

Imports like `@powersync/web` and `./db/index.js` are resolved by Vite. They will not work from a raw file server unless you run `npm run build` and serve `dist/`.

### Supabase auth errors

Confirm your project URL and anon key in `.env`. Check the Supabase dashboard for auth settings (email provider enabled, redirect URLs if using magic links).

### "Account not assigned to a restaurant"

Your `profiles.restaurant_id` is null. An admin must set it in Supabase, then refresh while online.

### Sync not connecting

Check `VITE_POWERSYNC_URL` (PowerSync Dashboard → Connect), Supabase session, assigned restaurant, and PowerSync dashboard (Supabase Auth enabled, Sync Streams deployed). See [PowerSync + Supabase sync](./powersync-supabase.html).

### Manager stuck on "loading..."

Common causes:

1. **Not using Vite** — `db.init()` hangs without a worker/WASM bundler. Use `npm run dev`.
2. **Blocking on sync** — awaiting `connectSync()` or `initDatabaseAndSync()` before rendering. The manager calls `initDatabase()`, subscribes to the watched query, then runs `void ensureSyncConnected(db)`.
3. **HMR during dev** — a hot reload can leave a half-initialized DB; hard-refresh the page.
4. **Wrong watch API** — use `registerListener({ onData })`, not `onResult` on `query().watch()`. See [Database — Watched queries](./database.html#watched-queries-live-ui).

### Login does not redirect to manager

Login must not `await connectSync()` before redirect — a slow PowerSync connection blocks navigation. Sync starts on the manager page instead.
