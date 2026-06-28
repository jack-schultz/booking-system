# Contributing

Short guide for where code belongs in this project. Full setup and architecture live in [docs/index.html](docs/index.html).

## Where to put things

| Change | Location |
|--------|----------|
| Page UI logic (forms, lists, clicks) | `booking/*.js`, `login.js`, `signup.js`, `index.js` |
| Page markup only | Matching `.html` file — keep scripts in separate `.js` files |
| Shared navbar / booking sidebar | `ui/navbar.js`, `ui/bookingSidebar.js` |
| SQL and booking CRUD | `db/bookings.js` |
| Database schema | `db/schema.js` |
| Schema migrations | `db/migrations/` (add numbered file + register in `index.js`) |
| Auth / account switching | `auth/accountSwitcher.js`, `auth/accounts.js` |
| App-wide constants | `config/constants.js`, `config/timeslots.js` |
| Styles | `style.css` |
| Supabase client config | `supabaseClient.js` + `.env` (see `.env.example`) |
| Documentation | `docs/*.md` |

## Conventions

- Use ES modules (`import` / `export`) in all `.js` files.
- Database columns use `snake_case`; JavaScript variables use `camelCase`.
- Run the app with `npm run dev` (Vite required for PowerSync WASM).
- Run tests with `npm test`.

## Intentional stubs as of writing

- `db/migrations/001.js`, `002.js` — only migration framework exists. Once db is live and needs migration, this lays out how it will work.
- `booking/walkin-create.html` — placeholder page, not in scope yet.
- PowerSync `connect()` — not wired yet; data is local-only until sync is implemented (see `docs/powersync-supabase.md`).
- `DEFAULT_RESTAURANT_ID` in `config/constants.js` — temporary until profiles sync from Supabase.

## Domain terms

- **PAX** — party size (total guests).
- **hc_pax** — high chair count.
- **Timeslot** — compact 24h string, e.g. `"0900"` = 9:00 AM; stored in `datetime` as ISO local time via `buildDatetime()`.
