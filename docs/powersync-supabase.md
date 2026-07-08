# PowerSync + Supabase sync

The app is **local-first**: PowerSync holds a SQLite replica in the browser. Supabase Postgres is the source of truth. Reads and writes always go through the local database; changes upload to Postgres when online and download from other devices via PowerSync Cloud.

## Architecture

```
┌──────────────┐     JWT      ┌─────────────────┐     sync     ┌──────────────┐
│   Browser    │─────────────▶│ PowerSync Cloud │◀────────────▶│  Supabase    │
│ PowerSync DB │              │   (service)     │              │  Postgres    │
└──────┬───────┘              └─────────────────┘              └──────────────┘
       │
       │ uploadData() ──────────────────────────────────────────▶ Supabase REST
       │ (CRUD queue → bookings table, RLS enforced)
```

1. User logs in via Supabase Auth.
2. App calls `connectSync(db)` with the Supabase connector (`db/supabaseConnector.js`).
3. PowerSync streams bookings for the user's restaurant into local SQLite (Sync Streams).
4. UI reads/writes the local `db` instance; the upload queue pushes changes to Supabase.
5. When offline, local SQLite continues to work; uploads resume on reconnect.

## Multi-restaurant security

Each account is linked to one restaurant via `profiles.restaurant_id`. Security is enforced at three layers:

| Layer | Mechanism |
|-------|-----------|
| PowerSync Sync Streams | Only download bookings where `restaurant_id` matches the user's profile |
| Supabase RLS | CRUD on `bookings` only when `restaurant_id = profiles.restaurant_id` for `auth.uid()` |
| Client queries | All booking SQL includes `WHERE restaurant_id = ?` from `getActiveRestaurantId()` |

Users without an assigned restaurant see a notice and cannot create or edit bookings until an admin sets `profiles.restaurant_id`.

## Supabase setup

Run [`supabase/migrations/001_initial.sql`](../supabase/migrations/001_initial.sql) in the Supabase SQL editor (or via Supabase CLI). This creates:

- `restaurants` — tenant registry
- `profiles` — one row per auth user (auto-created on signup via trigger)
- `bookings` — matches `db/schema.js`
- RLS policies scoped to the user's assigned restaurant

### PowerSync database role and publication

PowerSync needs a dedicated Postgres role with replication access. Run in the Supabase SQL editor:

```sql
-- Role for PowerSync replication (read-only on synced tables)
CREATE ROLE powersync_role WITH REPLICATION BYPASSRLS LOGIN PASSWORD 'your-secure-password';

GRANT SELECT ON ALL TABLES IN SCHEMA public TO powersync_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync_role;

-- Publication: only bookings need to replicate to clients
CREATE PUBLICATION powersync FOR TABLE bookings;
```

Notes:

- Use a strong password. If it contains special characters (`@`, `:`, `/`, etc.), **URL-encode** them in the connection URI you paste into PowerSync.
- The Supabase **database name** is always `postgres` (the path at the end of the direct connection string).
- `profiles` does not need to be in the publication — the Sync Stream subquery reads it server-side when evaluating who may sync what.

### Admin onboarding

1. User signs up → trigger creates `profiles` row with `restaurant_id = NULL`.
2. Admin creates a restaurant in the `restaurants` table.
3. Admin sets `profiles.restaurant_id` for that user in Supabase Table Editor (service role bypasses RLS).
4. User logs in or refreshes while online → profile syncs → PowerSync connects → bookings sync.

### Seed a test restaurant

```sql
insert into public.restaurants (name) values ('Demo Restaurant') returning id;
-- Use the returned id when assigning profiles.restaurant_id
update public.profiles set restaurant_id = 1 where id = '<user-uuid>';
```

## PowerSync Cloud setup

### 1. Create instance and connect to Supabase

1. Create a project at [PowerSync Dashboard](https://dashboard.powersync.com/).
2. Select your **Development** or **Production** instance.
3. Go to **Database Connections** → **Connect to Source Database**.
4. From Supabase: **Connect** → **Direct connection** → copy the URI (`db.<project-ref>.supabase.co:5432/postgres`).
5. In PowerSync, paste the URI, then set **Username** to `powersync_role` and **Password** to the role password you created above.
6. Use **SSL mode: verify-full** (PowerSync includes Supabase's CA certificate).
7. Click **Test Connection** and **Save**.

Important for the database connection:

| Use | Don't use |
|-----|-----------|
| Direct connection (`db.*.supabase.co:5432`) | Transaction pooler (`:6543`) or Supavisor pooler host |
| Username `powersync_role` | Default `postgres` user (unless you know why) |
| Database name `postgres` | A custom database name (Supabase uses `postgres`) |

PowerSync requires a **direct** Postgres connection for logical replication — poolers do not work.

If you enable **Supabase Network Restrictions**, allowlist PowerSync Cloud IPs for your region (IPv4 and IPv6). See [PowerSync IP filtering](https://docs.powersync.com/configuration/source-db/security-and-ip-filtering).

### 2. Enable Supabase Auth

In PowerSync Dashboard → **Client Auth** for your instance:

1. Enable **Use Supabase Auth** (JWKS auto-detected for hosted Supabase).
2. For legacy JWT signing keys only: paste the JWT secret into the optional legacy field. New signing keys can leave this empty.

### 3. Define Sync Streams

PowerSync now uses **Sync Streams** (edition 3), not legacy Sync Rules (`bucket_definitions`). In the Sync Streams editor, replace the template with:

```yaml
config:
  edition: 3

streams:
  restaurant_bookings:
    auto_subscribe: true
    query: |
      SELECT * FROM bookings
      WHERE restaurant_id = (
        SELECT restaurant_id FROM profiles WHERE id = auth.user_id()
      )
```

Key points:

- **`auto_subscribe: true`** — syncs on connect, same behavior as legacy Sync Rules. The app uses `db.connect()` without explicit `syncStream().subscribe()` calls.
- **`auth.user_id()`** — replaces legacy `request.user_id()` from Sync Rules.
- The subquery replaces the old separate `parameters:` + `data:` bucket pattern.

Alternative (equivalent JOIN form):

```yaml
streams:
  restaurant_bookings:
    auto_subscribe: true
    query: |
      SELECT bookings.*
      FROM bookings
      INNER JOIN profiles ON bookings.restaurant_id = profiles.restaurant_id
      WHERE profiles.id = auth.user_id()
```

Deploy the sync config from the dashboard. PowerSync also offers a **Migrate to Sync Streams** button if you have existing Sync Rules to convert.

Legacy Sync Rules reference (do not use for new setups):

```yaml
# Legacy — replaced by Sync Streams above
bucket_definitions:
  restaurant_bookings:
    parameters: SELECT restaurant_id FROM profiles WHERE id = request.user_id()
    data:
      - SELECT * FROM bookings WHERE restaurant_id = bucket.restaurant_id
```

### 4. Set `VITE_POWERSYNC_URL`

The client needs your PowerSync **instance endpoint** (not the dashboard URL, not Supabase):

1. In [PowerSync Dashboard](https://dashboard.powersync.com/), select your project and instance.
2. Click **Connect** in the top bar.
3. Copy the **instance URL**, e.g. `https://xxxxxxxx.powersync.journeyapps.com`.
4. Add to `.env`:

```env
VITE_POWERSYNC_URL=https://xxxxxxxx.powersync.journeyapps.com
```

Restart the Vite dev server after changing `.env`. For GitHub Pages, add the same value as repository secret `VITE_POWERSYNC_URL` (see [Deployment](./deployment.html)).

No separate PowerSync API key goes in the frontend — authentication uses the user's Supabase JWT at runtime.

## Client modules

| File | Role |
|------|------|
| [`db/supabaseConnector.js`](../db/supabaseConnector.js) | `fetchCredentials()` (Supabase JWT) and `uploadData()` (CRUD queue → Supabase) |
| [`db/sync.js`](../db/sync.js) | `connectSync`, `disconnectSync`, `reconnectSync` |
| [`db/index.js`](../db/index.js) | `initDatabaseAndSync()` — open local DB + connect when online and assigned |

### Connect lifecycle

| Event | Action |
|-------|--------|
| Login success | Redirect to manager (no `connectSync` on login page) |
| Manager page load | `initDatabase()` → subscribe to bookings → `void ensureSyncConnected(db)` |
| Other booking pages | `initDatabase()` / `initDatabaseAndSync()` + `ensureSyncConnected()` as needed |
| Account switch | `reconnectSync(db)` with new JWT |
| `window` `online` | Profile refresh + `reconnectSync(db)` |
| `TOKEN_REFRESHED` | `reconnectSync(db)` |
| Last account logout | `disconnectSync(db)` |

Sync is skipped when offline, `VITE_POWERSYNC_URL` is unset, or the user has no assigned restaurant.

### Live updates across devices

[`booking/manager.js`](../booking/manager.js) and [`booking/metrics.js`](../booking/metrics.js) use `db.query(...).watch()` with `registerListener({ onData })` so lists and metrics re-render when local data changes - including changes synced from other devices. See [Database](./database.html#watched-queries-live-ui).

## Environment variables

| Variable | Purpose | Where to get it |
|----------|---------|-----------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/publishable key | Supabase → Project Settings → API Keys |
| `VITE_POWERSYNC_URL` | PowerSync Cloud instance endpoint | PowerSync Dashboard → Connect |

Copy [`.env.example`](../.env.example) to `.env` for local dev.

## Offline behavior

- **Reads:** Served from local SQLite (IndexedDB-backed).
- **Writes:** Applied locally immediately; queued for upload.
- **Reconnect:** PowerSync reconnects on `online`, drains the upload queue, and downloads remote changes.
- **Profile cache:** `restaurant_id` is cached in localStorage per account for offline restaurant scoping.

## Local-only development

If `VITE_POWERSYNC_URL` is not set, the app runs in local-only mode — no network sync:

```javascript
const db = await initDatabase();
// CRUD via db/bookings.js — data stays in the browser
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `ECONNREFUSED` on IPv6 address when testing DB connection in PowerSync | Supabase direct connections use IPv6; network restrictions or IP ban | Allowlist PowerSync Cloud IPs (IPv4 + IPv6) in Supabase Network Restrictions; wait out failed-login IP bans |
| `password authentication failed` for `powersync_role` | Wrong password or special chars not URL-encoded | Reset password with `ALTER ROLE`; URL-encode password in connection URI |
| PowerSync Test Connection works but client won't sync | Missing `VITE_POWERSYNC_URL`, no restaurant assigned, or offline | Set env var; assign `profiles.restaurant_id`; check browser online |
| Manager stuck on "loading..." | Blocking on `connectSync` / `db.init()` race during HMR, or wrong watch API | Manager uses `initDatabase()` then `void ensureSyncConnected()`; use `registerListener({ onData })` on `query().watch()` — hard-refresh after HMR; see [Database](./database.html) |
| "Account not assigned to a restaurant" | `profiles.restaurant_id` is NULL | Admin sets restaurant in Supabase; user refreshes while online |
| Bookings local only, never appear in Supabase | Sync not connected or upload queue blocked | Check connect lifecycle; verify RLS allows insert for user's restaurant; open [sync status dashboard](../sync-status.html) for queue and errors |
| `All replication slots are in use` (Supabase) | Max 4 logical replication slots | Drop inactive slots — see [PowerSync Supabase troubleshooting](https://docs.powersync.com/configuration/source-db/connection#troubleshooting) |

`db.connected === false` in the browser is normal when offline, when `VITE_POWERSYNC_URL` is unset, or when the user has no assigned restaurant — local SQLite still works.

## Verification checklist

1. **Offline create:** Disable network → create booking → appears in manager → go online → booking in Supabase and on a second device.
2. **Remote update:** Edit on device A → manager on device B updates without manual refresh.
3. **RLS:** Direct Supabase REST insert with wrong `restaurant_id` → rejected.
4. **Unassigned user:** Profile with `restaurant_id = NULL` → notice shown, no sync/connect.
5. **Account switch:** Two users, two restaurants → correct bookings per account.
6. **Reconnect:** Offline changes upload when back online.
7. **Sync status UI:** Navbar icon turns yellow when uploads are pending or sync needs attention; `/sync-status.html` shows queue details and a manual **Reconnect** button.

## References

- [PowerSync JS Web SDK](https://docs.powersync.com/client-sdk-references/js-web)
- [PowerSync + Supabase integration](https://docs.powersync.com/integrations/supabase/guide)
- [Sync Streams overview](https://docs.powersync.com/sync/streams/overview)
- [Migrating from Sync Rules](https://docs.powersync.com/sync/streams/migration)
- [PowerSync Dashboard](https://docs.powersync.com/tools/powersync-dashboard)
