# Documentation

Restaurant booking system — vanilla HTML/JS frontend with Supabase auth and a local-first PowerSync database for all booking data.

## Contents

| Doc | Description |
|-----|-------------|
| [Getting started](./getting-started.html) | Install dependencies and run the dev server |
| [Architecture](./architecture.html) | Project layout, pages, and how data flows today |
| [Authentication](./authentication.html) | Supabase login, session checks, and route protection |
| [Database](./database.html) | PowerSync local SQLite, schema, and migrations |
| [PowerSync + Supabase roadmap](./powersync-supabase.html) | Planned cloud sync setup (local DB in use today) |
| [Deployment](./deployment.html) | GitHub Pages workflow, production builds, and how to add new pages |

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173/login.html

## Current state (summary)

- **Auth:** Supabase email/password login works on `login.html`.
- **Bookings UI:** Manager and create pages read/write bookings via PowerSync (`db/bookings.js`). Walk-in is a placeholder page.
- **Data:** Local-first — all booking CRUD goes through the PowerSync SQLite database in the browser. Data persists per origin (IndexedDB-backed) but does not sync to Supabase yet.
- **Sync:** Local-only for now. PowerSync Cloud + Supabase connector is planned (see [PowerSync + Supabase roadmap](./powersync-supabase.html)).
