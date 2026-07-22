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
                               ▼
              ┌─────────────────────────────────┐
              │ PowerSync Cloud <-> Supabase    │
              │ (Sync Streams + replication)    │
              └─────────────────────────────────┘
```

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | Vanilla HTML, CSS, inline/module scripts |
| Bundler / dev server | Vite 8 |
| PWA | `vite-plugin-pwa` (service worker, web manifest) |
| Auth | Supabase Auth (`@supabase/supabase-js`) |
| Local database | PowerSync Web + `@journeyapps/wa-sqlite` |
| Cloud sync | PowerSync Cloud + Supabase Postgres |
| Tests | Jest |
| Hosting | GitHub Pages (see [Deployment](./deployment.html)) |

## Pages

| Path | Purpose | Auth required |
|------|---------|---------------|
| `index.html` | Home / landing — public navbar with **Open Booking App** | No |
| `login.html` | Sign in; **Continue as [name]** when a stored account exists | No |
| `signup.html` | Create account — public navbar | No |
| `booking/manager` | SPA — manager view (list by day; live watch query) | Yes |
| `booking/metrics` | SPA — weekly lunch/dinner pax metrics | Yes |
| `booking/create` | SPA — create/edit view (`?edit=<id>`) | Yes |
| `booking/walkin` | SPA — walk-in placeholder | Yes |
| `booking/tables` | SPA — restaurant table admin | Yes |
| `booking/sync-status` | SPA — sync dashboard (upload queue, download activity, issues) | Yes |

**Navbar variants** ([`ui/navbar.js`](../ui/navbar.js)):

| Variant | Used on | Links |
|---------|---------|-------|
| `mountPublicNavbar` | index, signup, docs | Open Booking App |
| `mountAuthNavbar` | login | Auth controls only |
| `mountAppNavbar` | booking SPA | Bookings, Metrics, Tables, sync icon, auth |

App pages import [`pwa/register.js`](../pwa/register.js) to register the service worker from `vite-plugin-pwa`.

### Booking sidebar shell

Manager, create, walk-in, metrics, tables, and sync status share one JavaScript session ([`booking/app.js`](../booking/app.js)). The booking sidebar appears on manager / create / walk-in only; the app navbar handles all in-shell navigation.

See **[Booking shell](./booking-shell.html)** for routing, view lifecycle, extension guide, trade-offs, and testing checklist.

## Multi-restaurant model

- Each Supabase user has a row in `profiles` with an optional `restaurant_id`.
- An admin assigns `restaurant_id` after signup (see [PowerSync + Supabase sync](./powersync-supabase.html)).
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
| List by date | watched query over day range | [`booking/views/managerView.js`](../booking/views/managerView.js) |
| List by week | watched query over week range | [`booking/views/metricsView.js`](../booking/views/metricsView.js) |
| Load one | `getBookingById(db, id, restaurantId)` | [`booking/views/createView.js`](../booking/views/createView.js) (edit mode) |
| Create | `insertBooking(db, booking)` | [`booking/views/createView.js`](../booking/views/createView.js) |
| Update | `updateBooking(db, id, booking, restaurantId)` | [`booking/views/createView.js`](../booking/views/createView.js) |
| Update status | `updateBookingStatus(db, id, restaurantId, status)` | [`booking/views/managerView.js`](../booking/views/managerView.js) (status button) |
| Delete | `deleteBooking(db, id, restaurantId)` | [`booking/views/managerView.js`](../booking/views/managerView.js) |
| Pax aggregation | `aggregateBookingsByDay`, `aggregateBookingsByWeek`, `getWeekRange` | manager view, [`booking/views/metricsView.js`](../booking/views/metricsView.js) |

Changes upload to Supabase via `db/supabaseConnector.js` when online. Remote changes download via PowerSync Sync Streams.

[`login.html`](../login.html) authenticates and redirects. The booking shell ([`booking/bootstrap.js`](../booking/bootstrap.js)) calls `initDatabase()`, mounts views, and runs `ensureSyncConnected()` in the background when the user is authenticated, online, and assigned to a restaurant.

## Database module (`db/`)

| File | Role |
|------|------|
| `schema.js` | PowerSync `AppSchema` — tables and indexes |
| `openDB.js` | Singleton `PowerSyncDatabase` instance (`globalThis`, HMR-safe) |
| `index.js` | `initDatabase()`, `initDatabaseAndSync()` |
| `supabaseConnector.js` | PowerSync backend connector (JWT + upload) |
| `sync.js` | Connect/disconnect/reconnect helpers |
| `syncStatus.js` | Sync status snapshots, health state, issue log (for UI dashboard) |
| `bookings.js` | Booking CRUD, datetime helpers, status cycling, pax aggregation |
| `bookings.test.js` | Jest tests for datetime, aggregation, and meal-period logic |
| `migrate.js` | Runs `db.init()` and applies migration records |
| `migrations/` | Versioned one-off SQL hooks |

## Config module (`config/`)

| File | Role |
|------|------|
| `constants.js` | `BOOKING_STATUS` values, localStorage keys, DB filename, `PROFILE_SYNC_TTL_MS` |
| `timeslots.js` | Bookable timeslot options (9:00 AM–11:00 PM, 15 min steps), lunch/dinner cutoff (`DINNER_CUTOFF_TIMESLOT` = 5:00 PM) |
| `connectivity.js` | `isOnline()` wrapper around `navigator.onLine` |

## Auth module (`auth/`)

| File | Role |
|------|------|
| `accounts.js` | Multi-account localStorage cache, `hasAssignedRestaurant()` |
| `profiles.js` | Fetch profile from Supabase; cache `restaurant_id` offline; 5-minute sync TTL |
| `accountSwitcher.js` | Navbar switcher; reconnects sync on switch / online / token refresh |

## UI module (`ui/`)

| File | Role |
|------|------|
| `navbar.js` | Shared top nav; mounts offline badge and optional sync status icon (`showSyncIndicator`) |
| `syncIndicator.js` | Navbar sync icon — color reflects health (red offline, yellow attention, green up to date) |
| `paxSummary.js` | Pax breakdown markup (`formatPaxBreakdown`, `formatPaxSummary`, `formatMetricsPaxCell`) |
| `footer.js` | Shared footer |
| `bookingSidebar.js` | Booking sub-nav; client-side routes, active state, conditional save button |

## PWA (`pwa/`)

| File | Role |
|------|------|
| `register.js` | Registers the service worker via `vite-plugin-pwa` (`virtual:pwa-register`) |

Configured in `vite.config.js` with `navigateFallback: null` so the service worker does not redirect unknown URLs to `index.html` (important for multi-page routing on GitHub Pages).

The sync status icon navigates to `/booking/sync-status` within the SPA. Status is computed in [`db/syncStatus.js`](../db/syncStatus.js) from PowerSync `currentStatus`, upload queue stats, and browser connectivity — separate from [`db/sync.js`](../db/sync.js), which handles PowerSync connect/disconnect.

## Module types

All app pages use **ES modules** (`type="module"`) with separate `.js` entry files (`login.js`, `booking/app.js`, etc.) — resolved by Vite. Shared modules live under `auth/`, `db/`, `ui/`, `config/`, and `pwa/`.

## Related docs

- [PowerSync + Supabase sync](./powersync-supabase.html) — schema, Sync Streams, connector, offline behavior, troubleshooting
- [Authentication](./authentication.html) — login, profiles, restaurant assignment, profile sync TTL
- [Database](./database.html) — local SQLite, sync lifecycle, watched queries, booking shell load order
