# Documentation

Restaurant booking system — vanilla HTML/JS frontend with Supabase auth and a local-first PowerSync database synced to Supabase Postgres.

## Contents

| Doc | Description |
|-----|-------------|
| [Getting started](./getting-started.html) | Install dependencies, env vars, and run the dev server |
| [Architecture](./architecture.html) | Project layout, pages, and data flow |
| [Booking shell](./booking-shell.html) | Client-routed booking UI — routing, views, lifecycle, and how to extend |
| [Authentication](./authentication.html) | Supabase login, profiles, restaurant assignment |
| [Database](./database.html) | PowerSync local SQLite, sync lifecycle, watched queries |
| [PowerSync + Supabase sync](./powersync-supabase.html) | Schema, Sync Streams, connector, offline behavior, troubleshooting |
| [Deployment](./deployment.html) | GitHub Pages workflow, production builds, and how to add new pages |

## Quick start

```bash
npm install
cp .env.example .env   # set Supabase + PowerSync URLs
npm run dev
```

Open http://localhost:5173/login.html

## Current state (summary)

- **Auth:** Supabase email/password login; multi-account switcher with offline profile cache.
- **Bookings UI:** Client-routed sidebar shell — see [Booking shell](./booking-shell.html) for routing, views, and extension guide. Weekly metrics is a separate page.
- **Metrics:** Weekly pax overview at [`booking/metrics.html`](../booking/metrics.html) — lunch/dinner/day totals per weekday, week and weekend summaries.
- **Manager totals:** Per-timeslot pax breakdowns plus lunch, dinner, and day totals on the booking manager.
- **Data:** Local-first SQLite in the browser; offline reads/writes work without network.
- **Sync:** PowerSync Cloud + Supabase connector; Sync Streams (edition 3) scope bookings per restaurant (RLS + streams).
- **Sync status UI:** Navbar icon + [`sync-status.html`](../sync-status.html) dashboard for connection health, upload queue, and issues.
- **PWA:** Installable app shell via `vite-plugin-pwa` (service worker, manifest); pages import `pwa/register.js`.
- **Multi-restaurant:** Each account has one `restaurant_id` (admin-assigned); users only see and edit their restaurant's bookings.
