# Documentation

Restaurant booking system — vanilla HTML/JS frontend with Supabase auth and a local-first PowerSync database synced to Supabase Postgres.

## Contents

| Doc | Description |
|-----|-------------|
| [Getting started](./getting-started.html) | Install dependencies, env vars, and run the dev server |
| [Architecture](./architecture.html) | Project layout, pages, and data flow |
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
- **Bookings UI:** Manager (live watch query) and create pages read/write via PowerSync (`db/bookings.js`).
- **Data:** Local-first SQLite in the browser; offline reads/writes work without network.
- **Sync:** PowerSync Cloud + Supabase connector; Sync Streams (edition 3) scope bookings per restaurant (RLS + streams).
- **Sync status UI:** Navbar icon + [`sync-status.html`](../sync-status.html) dashboard for connection health, upload queue, and issues.
- **Multi-restaurant:** Each account has one `restaurant_id` (admin-assigned); users only see and edit their restaurant's bookings.
