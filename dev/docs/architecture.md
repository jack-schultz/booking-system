# Architecture

## Overview

A client-side restaurant booking app with no backend server of its own. The browser talks directly to:

1. **Supabase** — authentication and Postgres (bookings source of truth)
2. **PowerSync Cloud** — syncs Postgres rows into the browser
3. **PowerSync + SQLite** — local-first database; all booking reads/writes go here

```
┌────────────────────────────────────────────────────────────────┐
│                           Browser                              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ HTML pages  │  │supabaseClient│  │ db/ (PowerSync)        │ │
│  │ login,      │──│ .js          │  │ schema, connector,     │ │
│  │ booking/*   │  └──────┬───────┘  │ sync, bookings.js      │ │
│  └─────────────┘         │          └───────────┬────────────┘ │
│                          │                      │              │
│              ┌───────────▼──────────┐  ┌────────▼───────────┐  │
│              │ Supabase Auth API    │  │ WA-SQLite          │  │
│              └───────────┬──────────┘  │ (IndexedDB)        │  │
│                          │             └──────────┬─────────┘  │
│                          │                        │            │
│              ┌───────────▼────────────────────────▼─────────┐  │
│              │ uploadData() → Supabase REST (bookings)      │  │
│              └──────────────────────────────────────────────┘  │
└──────────────────────────────┬─────────────────────────────────┘
                               │
              ┌────────────────▼────────────────┐
              │ PowerSync Cloud ◀──▶ Supabase   │
              │ (Sync Streams + replication)    │
              └─────────────────────────────────┘
```

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | Vanilla HTML, CSS, inline/module scripts |
| Bundler / dev server | Vite 8 |
| Auth | Supabase Auth (`@supabase/supabase-js`) |
| Local database | PowerSync Web + `@journeyapps/wa-sqlite` |
| Cloud sync | PowerSync Cloud + Supabase Postgres |
| Tests | Jest |
| Hosting | GitHub Pages (see [Deployment](./deployment.md)) |

## Pages

| Path | Purpose | Auth required |
|------|---------|---------------|
| `index.html` | Home / landing | No |
| `login.html` | Sign in; initializes DB and sync | No |
| `signup.html` | Create account | No |
| `booking/manager.html` | List bookings by day (live watch query) | Yes |
| `booking/create.html` | New or edit booking (`?edit=<id>`) | Yes |
| `booking/walkin.html` | Walk-in placeholder | Yes |
| `sync-status.html` | Database sync status dashboard (upload queue, download activity, issues) | Yes |

All pages share a top navbar ([`ui/navbar.js`](../ui/navbar.js)) with Home, Booking Manager, an **Offline** badge when the browser is offline, a **sync status icon** (links to the dashboard), and account controls when logged in.

Booking pages also use a sidebar ([`ui/bookingSidebar.js`](../ui/bookingSidebar.js)) with links to manager, new booking, and walk-in flows.

## Multi-restaurant model

- Each Supabase user has a row in `profiles` with an optional `restaurant_id`.
- An admin assigns `restaurant_id` after signup (see [PowerSync + Supabase sync](./powersync-supabase.md)).
- Bookings are scoped to the active account's restaurant at every layer (Sync Streams, RLS, client SQL).
- The account switcher supports multiple logged-in users on one device; switching accounts reconnects PowerSync with the new JWT.

## Data model

Defined in `db/schema.js` for PowerSync (mirrored in Supabase `bookings`):

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | UUID primary key |
| `created_at` | text | ISO timestamp |
| `restaurant_id` | integer | From user's profile; tenant scope |
| `first_name`, `last_name` | text | Guest name |
| `phone_number`, `email` | text | Contact details |
| `total_pax`, `adult_pax`, `child_pax`, `hc_pax` | integer | Party size breakdown |
| `preference` | text | e.g. booth, table, window |
| `datetime` | text | ISO booking time |
| `profile_id` | text | Supabase user who created the booking |
| `status` | text | e.g. `pending`, `set`, `seated` |
| `notes` | text | Additional details from the form |

## Booking data flow

All booking CRUD goes through `db/bookings.js` and interacts with the **local** PowerSync database:

| Operation | Function | Used by |
|-----------|----------|---------|
| List by date | `getBookingsForDate(db, date, restaurantId)` | `booking/manager.html` (via watch query) |
| Load one | `getBookingById(db, id, restaurantId)` | `booking/create.html` (edit mode) |
| Create | `insertBooking(db, booking)` | `booking/create.html` |
| Update | `updateBooking(db, id, booking, restaurantId)` | `booking/create.html` |
| Delete | `deleteBooking(db, id, restaurantId)` | `booking/manager.html` |

Changes upload to Supabase via `db/supabaseConnector.js` when online. Remote changes download via PowerSync Sync Streams.

`login.html` initializes the local DB on load and redirects after auth. Booking pages call `initDatabase()`, subscribe to local data, then start `ensureSyncConnected()` in the background when the user is authenticated, online, and assigned to a restaurant.

## Database module (`db/`)

| File | Role |
|------|------|
| `schema.js` | PowerSync `AppSchema` — tables and indexes |
| `openDB.js` | Singleton `PowerSyncDatabase` instance (`globalThis`, HMR-safe) |
| `index.js` | `initDatabase()`, `initDatabaseAndSync()` |
| `supabaseConnector.js` | PowerSync backend connector (JWT + upload) |
| `sync.js` | Connect/disconnect/reconnect helpers |
| `syncStatus.js` | Sync status snapshots, health state, issue log (for UI dashboard) |
| `bookings.js` | Booking CRUD and datetime helpers |
| `migrate.js` | Runs `db.init()` and applies migration records |
| `migrations/` | Versioned one-off SQL hooks |

## Auth module (`auth/`)

| File | Role |
|------|------|
| `accounts.js` | Multi-account localStorage cache, `hasAssignedRestaurant()` |
| `profiles.js` | Fetch profile from Supabase; cache `restaurant_id` offline |
| `accountSwitcher.js` | Navbar switcher; reconnects sync on switch / online / token refresh |

## UI module (`ui/`)

| File | Role |
|------|------|
| `navbar.js` | Shared top nav; mounts offline badge and optional sync status icon (`showSyncIndicator`) |
| `syncIndicator.js` | Navbar sync icon — color reflects health (red offline, yellow attention, green up to date) |
| `footer.js` | Shared footer |
| `bookingSidebar.js` | Booking sub-nav on manager / create / walk-in pages |

The sync status icon links to [`sync-status.html`](../sync-status.html). Status is computed in [`db/syncStatus.js`](../db/syncStatus.js) from PowerSync `currentStatus`, upload queue stats, and browser connectivity — separate from [`db/sync.js`](../db/sync.js), which handles PowerSync connect/disconnect.

## Module types

- **ES modules** (`type="module"`): `login.html`, `booking/manager.html`, `booking/create.html`, `db/*`, `supabaseClient.js` — resolved by Vite.
- **Classic scripts + inline CDN**: `booking/walkin.html`, `signup.html` still load Supabase inline (or reference it without importing `supabaseClient.js`).

Long term, consolidate on `supabaseClient.js` imports everywhere for consistency.

## Related docs

- [PowerSync + Supabase sync](./powersync-supabase.md) — schema, Sync Streams, connector, offline behavior, troubleshooting
- [Authentication](./authentication.md) — login, profiles, restaurant assignment
- [Database](./database.md) — local SQLite, sync lifecycle, watched queries
