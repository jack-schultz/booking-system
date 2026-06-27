# Authentication

Account handling uses [Supabase Auth](https://supabase.com/docs/guides/auth) with email and password.

## Client setup

`supabaseClient.js` creates a shared client:

```javascript
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Import this module from any page served through Vite:

```javascript
import { supabase } from "../supabaseClient.js";
```

## Login flow (`login.html`)

1. On page load, `initDatabase()` starts initializing the local PowerSync database in parallel.
2. User submits email/password.
3. `supabase.auth.signInWithPassword()` runs.
4. On success, the page awaits the DB init promise, then redirects to `booking/manager.html`.

This ensures the local database is ready before the user reaches booking pages.

## Signup (`signup.html`)

Uses `supabase.auth.signUp()` with an inline script. It does not yet import `supabaseClient.js` — should be updated to match `login.html`.

## Protecting routes

Booking pages verify a session before rendering sensitive content:

```javascript
async function login() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = "../login.html";
        return;
    }
    document.getElementById("logged_in_user").innerHTML = user.email;
}
login();
```

`booking/manager.html` and `booking/create.html` use this pattern with the shared client. `booking/walkin-create.html` duplicates inline Supabase setup instead of importing `supabaseClient.js`.

## Logout

```javascript
await supabase.auth.signOut();
window.location.href = "../login.html";
```

Logout links use `id="logoutBtn"` in the nav bar on protected pages.

## Session persistence

Supabase stores the session in `localStorage` by default. Refreshing a protected page keeps the user logged in until the session expires or they sign out.

## Security notes

- The **anon/publishable key** in `supabaseClient.js` is safe to expose in frontend code. Row-level security (RLS) on Postgres must enforce access rules server-side.
- Never put the Supabase **service role** key in frontend code.
- When PowerSync sync is added, the connector will pass the user's Supabase JWT to PowerSync — that token must be fetched from `supabase.auth.getSession()` at connect time, not hard-coded.

## Planned improvements

- [ ] Use `supabaseClient.js` on `signup.html` and `booking/walkin-create.html`
- [ ] Centralize `protectPage()` in a shared `auth.js` module
- [ ] Link `profile_id` on bookings to `auth.users` / a `profiles` table
- [ ] Add RLS policies in Supabase before production use
