# Getting started

## Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- A Supabase project (for auth; see [Authentication](./authentication.md))

## Install

```bash
npm install
```

Peer dependency `@journeyapps/wa-sqlite` is listed in `devDependencies` and is required by `@powersync/web`.

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
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Jest tests |

## Project layout

```
booking-system/
├── booking/           # Booking manager, create, walk-in pages
├── db/                # PowerSync schema, open/init, migrations, booking helpers
│   ├── bookings.js    # CRUD helpers (get, insert, update, delete)
│   └── ...
├── docs/              # This documentation
├── login.html         # Login (initializes local DB)
├── signup.html        # Account creation
├── index.html         # Home
├── supabaseClient.js  # Shared Supabase client (ES module)
├── style.css          # Global styles
└── vite.config.js     # Dev/build config for PowerSync
```

## Typical dev flow

1. Start `npm run dev`.
2. Log in at `/login.html` — this runs Supabase auth and initializes the local PowerSync database.
3. Use the booking pages under `/booking/` — manager lists today's bookings; create saves to local SQLite.

## Troubleshooting

### `db.init()` hangs forever

You are likely serving files without Vite (e.g. `python -m http.server` or opening HTML directly). Use `npm run dev`. See [Database](./database.md).

### Module import errors in the browser

Imports like `@powersync/web` and `./db/index.js` are resolved by Vite. They will not work from a raw file server unless you run `npm run build` and serve `dist/`.

### Supabase auth errors

Confirm your project URL and anon/publishable key in `supabaseClient.js`. Check the Supabase dashboard for auth settings (email provider enabled, redirect URLs if using magic links).
