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

1. On page load, `initDatabase()` starts initializing the local PowerSync database in parallel.
2. User submits email/password.
3. `supabase.auth.signInWithPassword()` runs.
4. On success:
   - `registerLoggedInSession()` caches the account and syncs profile from Supabase.
   - The page awaits the DB init promise (local SQLite only).
5. Redirect to `booking/manager.html` — **sync is not started on the login page**. The manager connects PowerSync in the background after the booking list subscribes.

## Signup (`signup.html`)

Uses `supabase.auth.signUp()` with first/last name in user metadata. A Supabase trigger creates a `profiles` row automatically. **Restaurant assignment is admin-only** — new users have `restaurant_id = NULL` until an admin sets it in Supabase.

## Profiles and restaurant assignment

[`auth/profiles.js`](../auth/profiles.js) loads `first_name`, `last_name`, and `restaurant_id` from `public.profiles`:

```javascript
await supabase
    .from('profiles')
    .select('first_name, last_name, restaurant_id')
    .eq('id', userId)
    .maybeSingle();
```

Profile data is merged into the offline account cache in localStorage ([`auth/accounts.js`](../auth/accounts.js)) so `restaurant_id` is available offline after first sync.

### Admin workflow

1. User signs up.
2. Admin creates a restaurant and sets `profiles.restaurant_id` for that user.
3. User refreshes or logs in while online — profile syncs — booking pages unlock and PowerSync connects.

### Unassigned accounts

If `restaurant_id` is null, `hasAssignedRestaurant()` returns false. Booking pages show a notice and disable create/edit. PowerSync does not connect until a restaurant is assigned.

## Multi-account switcher

[`auth/accountSwitcher.js`](../auth/accountSwitcher.js) supports multiple logged-in accounts on one device:

- Accounts and tokens stored in localStorage.
- Switching accounts calls `supabase.auth.setSession()` and `reconnectSync()` so PowerSync uses the new JWT and syncs the correct restaurant's bookings.
- On `window` `online`, profiles re-sync and PowerSync reconnects.

## Protecting routes

Booking pages use `initAccountSwitcher({ requireAuth: true })` which redirects to login when no active account exists.

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
- [Architecture](./architecture.html) — auth module layout
