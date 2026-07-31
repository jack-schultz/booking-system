# Authentication

Account handling uses [Supabase Auth](https://supabase.com/docs/guides/auth) with email and password. Each user has a `profiles` row in Supabase linked to one restaurant (assigned by an admin).

## Client setup

`supabaseClient.js` creates a shared client from environment variables:

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

Import this module from any page served through Vite:

```javascript
import { supabase } from "../supabaseClient.js";
```

## Login flow (`login.html`)

On load:

1. `mountAuthNavbar()` — account switcher and logout (no app section links).
2. `initAccountSwitcher()` restores any stored session from localStorage.
3. If a stored account exists, a **Continue as [name]** prompt appears; **Continue** redirects to `booking/manager`.
4. The login form remains available to sign in as another account (multi-account support).

On form submit:

1. User submits email/password.
2. `supabase.auth.signInWithPassword()` runs.
3. On success:
   - `registerLoggedInSession()` caches the account and syncs profile from Supabase (forced refresh).
4. Redirect to `booking/manager` — **DB init and sync start on the booking shell**, not on the login page. PowerSync connects in the background after the shell loads.

## Signup (`signup.html`)

Uses `supabase.auth.signUp()` with first/last name in user metadata. A Supabase trigger creates a `profiles` row automatically. **Restaurant assignment is admin-only** — new users have `restaurant_id = NULL` until an admin sets it in Supabase.

## Profiles and restaurant assignment

[`auth/profiles.js`](../auth/profiles.js) loads `first_name`, `last_name`, `restaurant_id`, and `is_demo` (via join on `restaurants`) from `public.profiles`:

```javascript
await supabase
    .from('profiles')
    .select('first_name, last_name, restaurant_id, restaurants(is_demo)')
    .eq('id', userId)
    .maybeSingle();
```

Profile data is merged into the offline account cache in localStorage ([`auth/accounts.js`](../auth/accounts.js)) so `restaurant_id` and `is_demo` are available offline after first sync.

While online, profile fetches are cached for **5 minutes** (`PROFILE_SYNC_TTL_MS` in [`config/constants.js`](../config/constants.js)) to avoid a Supabase round-trip on every page load. Account switch, sign-in, token refresh, and coming back online always force a fresh fetch.

### Admin workflow

1. User signs up.
2. Admin creates a restaurant and sets `profiles.restaurant_id` for that user.
3. User refreshes or logs in while online — profile syncs — booking pages unlock and PowerSync connects.

### Unassigned accounts

If `restaurant_id` is null, `hasAssignedRestaurant()` returns false. Booking pages show a notice and disable create/edit. PowerSync does not connect until a restaurant is assigned.

## Demo sandbox

Visitors can try the app without signing up via **Open Demo** / **Continue in Demo Mode** on the landing page, login page, and signup page. Demo uses a **real Supabase auth user** assigned to a shared sandbox restaurant — the same PowerSync and booking code paths as production users.

### Client flow

1. User clicks a demo button ([`auth/demoMode.js`](../auth/demoMode.js)).
2. `signInAsDemo()` calls `supabase.auth.signInWithPassword()` with `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`.
3. `registerLoggedInSession()` caches the account and syncs profile (including `is_demo`).
4. Redirect to `booking/manager` — PowerSync connects normally.
5. When `is_demo` is true, a yellow banner appears ([`ui/demoBanner.js`](../ui/demoBanner.js)) and the account switcher hides **Add account**.

### One-time Supabase setup

1. Run migrations [`001_initial.sql`](../supabase/migrations/001_initial.sql) through [`005_demo_sandbox.sql`](../supabase/migrations/005_demo_sandbox.sql).
2. Create a demo auth user in Supabase Dashboard → **Authentication** → **Users** (email/password must match `.env`).
3. Run [`supabase/seed/demo_account_setup.sql`](../supabase/seed/demo_account_setup.sql) in the SQL editor (assigns profile to demo restaurant and seeds sample bookings).

Set in `.env` (and CI secrets for deploy):

```env
VITE_DEMO_EMAIL=demo@example.com
VITE_DEMO_PASSWORD=your-demo-password
```

These values are **intentionally public** in the client bundle — acceptable for a shared sandbox with no real data.

### Demo limits and protection

| Limit | Enforcement |
|-------|-------------|
| Max 5 bookings | Postgres `BEFORE INSERT` trigger on `bookings` (`005_demo_sandbox.sql`) + client notice on create form |
| Table layout read-only | RLS blocks `INSERT`/`UPDATE`/`DELETE` on `tables` for demo restaurants |
| Shared data | All demo users share one restaurant; changes are visible to other demo sessions |

### Resetting demo data

**Manual reset** (SQL editor, service role):

```sql
select public.reset_demo_sandbox();
```

This deletes all bookings for the demo restaurant and re-inserts the seed bookings.

**Automated nightly reset (optional):**

Using [pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron) (enable in Supabase → Database → Extensions):

```sql
create extension if not exists pg_cron;

select cron.schedule(
  'reset-demo-sandbox',
  '0 3 * * *',  -- 03:00 UTC daily
  $$ select public.reset_demo_sandbox(); $$
);
```

Alternative: a Supabase Edge Function that calls `reset_demo_sandbox()` via the service role, triggered on a schedule with Supabase cron or an external scheduler.

## Multi-account switcher

[`auth/accountSwitcher.js`](../auth/accountSwitcher.js) supports multiple logged-in accounts on one device:

- Accounts and tokens stored in localStorage.
- Switching accounts calls `supabase.auth.setSession()` and `reconnectSync()` so PowerSync uses the new JWT and syncs the correct restaurant's bookings.
- On `window` `online`, profiles re-sync and PowerSync reconnects.

## Protecting routes

The booking shell calls `initAccountSwitcher({ requireAuth: true })` in [`booking/bootstrap.js`](../booking/bootstrap.js), which redirects to login when no active account exists.

## Logout

Removing the last account calls `supabase.auth.signOut()` and `disconnectSync()`. If other accounts remain, the next account becomes active and sync reconnects.

## Session persistence

Supabase stores the session in `localStorage` by default. Refreshing a protected page keeps the user logged in until the session expires or they sign out.

## PowerSync authentication

The PowerSync connector passes the user's Supabase JWT to PowerSync Cloud via `fetchCredentials()`:

```javascript
const { data: { session } } = await supabase.auth.getSession();
return {
  endpoint: import.meta.env.VITE_POWERSYNC_URL,
  token: session.access_token,
};
```

- **`VITE_POWERSYNC_URL`** — instance endpoint from PowerSync Dashboard → **Connect** (e.g. `https://xxxxxxxx.powersync.journeyapps.com`). This is not your Supabase URL.
- **No separate PowerSync secret** in the frontend — the Supabase access token authenticates sync.

Always fetch a fresh session — do not use cached tokens from the account switcher for PowerSync.

On `TOKEN_REFRESHED`, the app reconnects sync so PowerSync receives the updated JWT.

## Security notes

- The **anon/publishable key** is safe to expose in frontend code. Row-level security (RLS) on Postgres enforces access rules server-side.
- Never put the Supabase **service role** key in frontend code.
- Users cannot change their own `restaurant_id` (RLS policy blocks it). Admin assignment uses the service role or dashboard.

## Related docs

- [PowerSync + Supabase sync](./powersync-supabase.html) — RLS, Sync Streams, admin onboarding, troubleshooting
- [Architecture](./architecture.html) — booking sidebar shell, pages, and data flow
