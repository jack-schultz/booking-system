# Architecture

## Overview

A client-side restaurant booking app with no backend server of its own. The browser talks directly to:

1. **Supabase** — authentication (and eventually Postgres via PowerSync sync)
2. **PowerSync + SQLite** — local-first database in the browser (offline-capable); all booking data lives here today

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ HTML pages  │  │supabaseClient│  │ db/ (PowerSync)│  │
│  │ login,      │──│ .js          │  │ schema,        │  │
│  │ booking/*   │  └──────┬───────┘  │ bookings.js    │  │
│  └─────────────┘         │          └───────┬────────┘  │
│                          │                  │           │
│              ┌───────────▼──────────┐  ┌────▼─────────┐ │
│              │ Supabase Auth API    │  │ WA-SQLite    │ │
│              └───────────┬──────────┘  │ (IndexedDB)  │ │
│                          │             └──────────────┘ │
└──────────────────────────┼──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │ Supabase (hosted)       │
              │ Auth + Postgres (later) │
              └─────────────────────────┘
```

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | Vanilla HTML, CSS, inline/module scripts |
| Bundler / dev server | Vite 8 |
| Auth | Supabase Auth (`@supabase/supabase-js` via CDN ESM) |
| Local database | PowerSync Web + `@journeyapps/wa-sqlite` |
| Tests | Jest |
| Hosting | GitHub Pages (see [Deployment](./deployment.md)) |

## Pages

| Path | Purpose | Auth required |
|------|---------|---------------|
| `index.html` | Home / landing | No |
| `login.html` | Sign in; initializes PowerSync DB | No |
| `signup.html` | Create account | No |
| `booking/manager.html` | List today's bookings (expand/collapse, edit, delete) | Yes |
| `booking/create.html` | New or edit booking (`?edit=<id>`) | Yes |
| `booking/walkin.html` | Walk-in placeholder | Yes |

All booking pages share a nav bar with links to manager, new booking, and walk-in flows.

## Data model

Defined in `db/schema.js` for PowerSync:

| Column | Type | Notes |
|--------|------|-------|
| `id` | text | UUID primary key |
| `created_at` | text | ISO timestamp |
| `restaurant_id` | integer | Hard-coded to `1` for now; should come from user profile |
| `first_name`, `last_name` | text | Guest name |
| `phone_number`, `email` | text | Contact details |
| `total_pax`, `adult_pax`, `child_pax`, `hc_pax` | integer | Party size breakdown |
| `preference` | text | e.g. booth, table, window |
| `datetime` | text | ISO booking time (`YYYY-MM-DDTHH:mm:00`) |
| `profile_id` | text | Optional link to Supabase user |
| `status` | text | e.g. `confirmed` |
| `notes` | text | Additional details from the form |

## Booking data flow

All booking CRUD goes through `db/bookings.js`:

| Operation | Function | Used by |
|-----------|----------|---------|
| List by date | `getBookingsForDate(db, dateStr)` | `booking/manager.html` |
| Load one | `getBookingById(db, id)` | `booking/create.html` (edit mode) |
| Create | `insertBooking(db, booking)` | `booking/create.html` |
| Update | `updateBooking(db, id, booking)` | `booking/create.html` |
| Delete | `deleteBooking(db, id)` | `booking/manager.html` |

Helper functions (`buildDatetime`, `formatTimeslot`, `getTimeslotFromDatetime`, etc.) keep datetime formatting consistent between pages.

`login.html` calls `initDatabase()` on load so the local DB is ready before the user reaches booking pages. Manager and create each call `initDatabase()` as well (singleton via `openDB.js`).

## Database module (`db/`)

| File | Role |
|------|------|
| `schema.js` | PowerSync `AppSchema` — tables and indexes |
| `openDB.js` | Singleton `PowerSyncDatabase` instance |
| `index.js` | `initDatabase()` — open + migrate |
| `bookings.js` | Booking CRUD and datetime helpers |
| `migrate.js` | Runs `db.init()` and applies migration records |
| `migrations/` | Versioned one-off SQL hooks (mostly no-ops; schema is declarative) |

## Module types

- **ES modules** (`type="module"`): `login.html`, `booking/manager.html`, `booking/create.html`, `db/*`, `supabaseClient.js` — resolved by Vite.
- **Classic scripts + inline CDN**: `booking/walkin.html`, `signup.html` still load Supabase inline (or reference it without importing `supabaseClient.js`).

Long term, consolidate on `supabaseClient.js` imports everywhere for consistency.

## What's next

- Wire up PowerSync Cloud + Supabase sync (see [PowerSync + Supabase roadmap](./powersync-supabase.md))
- Replace hard-coded `restaurant_id: 1` with a value from the user's profile
- Implement walk-in booking flow
- Centralize route protection in a shared `auth.js` module
