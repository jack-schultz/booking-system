# PowerSync + Supabase roadmap

The app is built **local-first**: PowerSync holds a SQLite replica in the browser, with Supabase Postgres as the source of truth once sync is enabled.

**Current phase:** local-only. Booking pages read and write the local PowerSync database. `db.connect()` is not called yet — data stays in the browser per origin.

## Target architecture

```
┌──────────────┐     JWT      ┌─────────────────┐     sync     ┌──────────────┐
│   Browser    │─────────────▶│ PowerSync Cloud │◀────────────▶│  Supabase    │
│ PowerSync DB │              │   (service)     │              │  Postgres    │
└──────────────┘              └─────────────────┘              └──────────────┘
```

1. User logs in via Supabase Auth.
2. App calls `db.connect(connector)` with a connector that supplies the Supabase access token.
3. PowerSync streams relevant rows into local SQLite based on **sync rules**.
4. UI reads/writes the local `db` instance; changes upload to Postgres through PowerSync.

## What is done

- [x] `@powersync/web` and `@journeyapps/wa-sqlite` installed
- [x] Vite configured for workers/WASM
- [x] `AppSchema` with full `bookings` table (name, contact, pax, preference, notes, etc.)
- [x] `initDatabase()` on login
- [x] Local migration tracking table (`migrations`, `localOnly: true`)
- [x] `db/bookings.js` CRUD helpers
- [x] Manager, create, and edit flows use PowerSync (no `localStorage` or direct Supabase inserts)

## What is left

### 1. Supabase Postgres schema

Create tables in Supabase matching `db/schema.js`. Example:

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  restaurant_id bigint not null,
  first_name text not null,
  last_name text,
  phone_number text,
  email text,
  total_pax integer not null,
  adult_pax integer not null,
  child_pax integer not null default 0,
  hc_pax integer not null default 0,
  preference text,
  datetime timestamptz not null,
  profile_id uuid references auth.users(id),
  status text,
  notes text
);
```

Enable RLS and add policies scoped to the authenticated user or restaurant.

### 2. PowerSync instance

- Create a project at [PowerSync](https://www.powersync.com/)
- Connect it to your Supabase Postgres database
- Define **sync rules** (e.g. sync bookings where `restaurant_id` matches the user's restaurant)

### 3. Backend connector (frontend)

Implement a `PowerSyncBackendConnector` that:

```javascript
async fetchCredentials() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return {
    endpoint: POWERSYNC_URL,
    token: session.access_token,
  };
}

async uploadData(database) {
  // Read CRUD queue from local DB and apply to Supabase via REST/RPC
}
```

Call after login:

```javascript
const db = await initDatabase();
await db.connect(connector);
```

See the [PowerSync JS Web SDK reference](https://docs.powersync.com/client-sdk-references/js-web) and the [Supabase + PowerSync tutorial](https://docs.powersync.com/integration-guides/supabase).

### 4. Connect sync after login

Once the connector and sync rules exist, call `db.connect(connector)` after `initDatabase()` on login (or on first protected page load). The existing `db/bookings.js` queries should keep working — PowerSync mirrors remote changes into the same local tables.

Consider watched queries for live UI updates on the manager page.

### 5. Profile and restaurant scoping

- Add a `profiles` table (or similar) in Supabase with `restaurant_id`
- Replace the hard-coded `restaurant_id: 1` in `booking/create.html` with the logged-in user's restaurant
- Scope sync rules and RLS to that restaurant

## Local-only development (now)

You can develop against the local database without PowerSync Cloud:

```javascript
const db = await initDatabase();
// use db.execute / db.getAll — or the bookings.js helpers — no connect() needed
```

Data persists in the browser (IndexedDB-backed SQLite) across sessions on the same origin.

## References

- [PowerSync JS Web SDK](https://docs.powersync.com/client-sdk-references/js-web)
- [PowerSync + Supabase integration](https://docs.powersync.com/integration-guides/supabase)
- [Example: Vite + React + PowerSync + Supabase](https://github.com/powersync-community/vite-react-ts-powersync-supabase)
