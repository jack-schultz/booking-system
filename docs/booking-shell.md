# Booking shell

The booking section uses a **client-routed SPA**: manager, create, walk-in, metrics, tables, and sync status share one JavaScript session and one PowerSync database connection. Navigation swaps views in place instead of reloading the page.

## What it is

Six app screens live inside a single HTML document:

| Route | URL | View container | Module | Booking sidebar |
|-------|-----|----------------|--------|-----------------|
| Manager | `booking/manager` | `#view-manager` | [`booking/views/managerView.js`](../booking/views/managerView.js) | Yes |
| Create / edit | `booking/create` (`?edit=<id>` for edit) | `#view-create` | [`booking/views/createView.js`](../booking/views/createView.js) | Yes |
| Walk-in | `booking/walkin` | `#view-walkin` | [`booking/views/walkinView.js`](../booking/views/walkinView.js) | Yes |
| Metrics | `booking/metrics` | `#view-metrics` | [`booking/views/metricsView.js`](../booking/views/metricsView.js) | No |
| Tables | `booking/tables` | `#view-tables` | [`booking/views/tablesView.js`](../booking/views/tablesView.js) | No |
| Sync status | `booking/sync-status` | `#view-sync-status` | [`booking/views/syncStatusView.js`](../booking/views/syncStatusView.js) | No |

All routes load the same shell: [`booking/app.html`](../booking/app.html) → [`booking/app.js`](../booking/app.js). The pathname segment after `/booking/` tells the router which view to show on first load. At build time, [`vite/bookingRoutePlugin.js`](../vite/bookingRoutePlugin.js) copies the built shell to `dist/booking/{route}/index.html` so GitHub Pages can serve pretty URLs without server rewrites.

## Why the shell exists

Opening a booking page is expensive compared to a typical static site:

1. **Auth**, restore session, optionally fetch profile from Supabase.
2. **Local database**, open PowerSync + SQLite (WASM, IndexedDB).
3. **Sync**, connect PowerSync streams for the user's restaurant.

Those steps run once when any booking URL loads. Sidebar clicks then only **unmount the current view and mount the next one**. PowerSync, SQLite, and the auth session stay in memory.

Benefits:

- **Faster sidebar navigation**, no second DB open or profile round-trip on every click.
- **Shared state**, one `db` instance passed to all views; no duplicate init logic.
- **URL compatibility**, bookmarks, login redirects, and `?edit=` links use pretty paths (`/booking/create`, etc.).
- **Browser history**, back and forward work via the History API.

## Drawbacks and limits

| Limitation | Detail |
|------------|--------|
| Larger initial HTML | All view markup ships in one document, even if the user only opens one screen. |
| Mount/unmount discipline | Views must clean up listeners and PowerSync watches in `unmount()`. Leaks show up as duplicate handlers or stale queries. |
| DOM scoping | Query inside the view root (`#view-manager`, etc.), not `document` globally, multiple views coexist in one page. |
| Not a full SPA | Public pages (`index.html`, `login.html`, `signup.html`, docs) still do full page loads. Only routes inside the booking shell are client-routed. |

These trade-offs are intentional: the shell optimizes the high-frequency path (switching between bookings / new booking / walk-in) without rewriting the whole app.

## Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         Booking shell (one session)                       │
│                                                                           │
│  booking/app.html  (+ build copies → booking/manager, create, walkin)     │
│       │                                                                   │
│       ▼                                                                   │
│  booking/app.js ─────┬────────────────────────────────────────────┐       │
│                      │                                            │       │
│                      ▼                                            ▼       │
│           booking/bootstrap.js                          booking/router.js │
│           • navbar, footer, sidebar                     • routes          │
│           • initAccountSwitcher                         • pushState       │
│           • initDatabase (once)                         • popstate        │
│           • ensureSyncConnected                         • mount/unmount   │
│                      │                                             │      │
│                      └─────── db, registerOnAccountSwitch ─────────┘      │
│                                      │                                    │
│                    ┌─────────────────┼─────────────────┐                  │
│                    ▼                 ▼                 ▼                  │
│            managerView.js     createView.js     walkinView.js             │
│            #view-manager        #view-create      #view-walkin            │
└───────────────────────────────────────────────────────────────────────────┘
```

### Module roles

| File | Responsibility |
|------|----------------|
| [`booking/app.js`](../booking/app.js) | Entry point: bootstrap, register views with router, start routing. |
| [`booking/bootstrap.js`](../booking/bootstrap.js) | One-time startup: chrome, auth, DB, sync, account-switch registry. |
| [`booking/router.js`](../booking/router.js) | Map pathname -> view; `navigate()`; History API; show/hide containers. |
| [`booking/views/*.js`](../booking/views/) | Per-screen logic with `mount()` / `unmount()` lifecycle. |
| [`ui/bookingSidebar.js`](../ui/bookingSidebar.js) | Sidebar buttons call `onNavigate(route)` — visible on manager / create / walk-in only. |
| [`ui/navbar.js`](../ui/navbar.js) | `mountAppNavbar()` — Bookings, Metrics, Tables, sync icon; all client-routed within the shell. |

## Startup sequence

When the user opens any booking shell URL, [`booking/app.js`](../booking/app.js) runs **once**:

1. **Parse route**, `parseRouteFromLocation()` reads pathname and `?edit=` query.
2. **Bootstrap**, [`booking/bootstrap.js`](../booking/bootstrap.js):
   - Mount navbar, footer, booking sidebar.
   - `initAccountSwitcher({ requireAuth: true })`.
   - `initDatabase()`, open local SQLite.
   - `void ensureSyncConnected(db)`, sync in background (non-blocking).
3. **Router start**, show the matching `#view-*` container and call that view's `mount()`.

Step 2 (auth, DB, sync) does **not** repeat when the user clicks sidebar items. Only the active view's `unmount()` and the next view's `mount()` run.

See [Database; Page load order](./database.html#page-load-order-booking-shell) for how this ties into PowerSync and watched queries.

### Flash prevention

The shell HTML includes a small inline script in `<head>` that hides the wrong view containers before JavaScript loads. Without it, opening `/booking/create` could briefly show the manager list.

## Client-side navigation

```mermaid
  ┌──────┐         ┌───────────────────┐         ┌───────────┐  ┌──────────────┐   ┌───────────┐
  │ User │         │ bookingSidebar.js │         │ router.js │  │ current view │   │ next view │
  └───┬──┘         └─────────┬─────────┘         └─────┬─────┘  └───────┬──────┘   └─────┬─────┘
      │                      │                         │                │                │
      │  Click NEW BOOKING   │                         │                │                │
      │─────────────────────>│                         │                │                │
      │                      │                         │                │                │
      │                      │  onNavigate("create")   │                │                │
      │                      │────────────────────────>│                │                │
      │                      │                         │                │                │
      │                      │                         │   unmount()    │                │
      │                      │                         │───────────────>│                │
      │                      │                         │                │                │
      │                      │                         │┌───────────────────────────────┐│
      │                      │                         ││ Close watches, abort listeners││
      │                      │                         │└───────────────────────────────┘│
      │                      │                         │                │                │
      │                      │                         ├───┐            │                │
      │                      │                         │   │ history.pushState -> /booking/create
      │                      │                         │<──┘            │                │
      │                      │                         │                │                │
      │                      │                         │    mount({ db, onNavigate })    │
      │                      │                         │────────────────────────────────>│
      │                      │                         │                │                │
      │                      │                         │           ┌────────────────────────────┐
      │                      │                         │           │ DB and PowerSync unchanged │
      │                      │                         │           └────────────────────────────┘
      │                      │                         │                │                │
  ┌───┴──┐         ┌─────────┴─────────┐         ┌─────┴─────┐  ┌───────┴──────┐   ┌─────┴─────┐
  │ User │         │ bookingSidebar.js │         │ router.js │  │ current view │   │ next view │
  └──────┘         └───────────────────┘         └───────────┘  └──────────────┘   └───────────┘
```

| User action | Behaviour |
|-------------|-----------|
| Sidebar: Bookings / New Booking / Walk-in | `pushState` + view swap, no document reload |
| Browser back / forward | `popstate` -> unmount current, mount view for URL |
| Link to `/booking/create?edit=<id>` | Full load into shell; router opens create view in edit mode |
| Login redirect to `/booking/manager` | Full load; router opens manager view |
| Save booking (create view) | `onNavigate('manager')`, client navigation back to list |
| App navbar: Metrics / Tables / sync icon | `onNavigate(...)` — view swap, no document reload |

The router updates the URL with `history.pushState` so the address bar always matches the visible view. State `{ route, editId }` is stored on the history entry for back/forward.

## View lifecycle contract

Every view module exports two functions:

```javascript
/**
 * @param {{
 *   db: PowerSyncDatabase,
 *   onNavigate: (route: string, options?: { edit?: string, replace?: boolean }) => void,
 *   registerOnAccountSwitch: (fn: (account) => void) => () => void,
 *   editId?: string | null,  // create view only
 * }} ctx
 */
export async function mountExampleView(ctx) { /* ... */ }

export async function unmountExampleView() { /* ... */ }
```

### `mount(ctx)`

- Store `ctx.db` and `ctx.onNavigate` if needed.
- Create an `AbortController` and pass `{ signal }` to all `addEventListener` calls.
- Register for account switches via `ctx.registerOnAccountSwitch()` when the view depends on restaurant scope (e.g. re-subscribe bookings).
- Query DOM **inside the view container** (e.g. `document.getElementById('view-manager').querySelector(...)`).
- Start PowerSync watched queries here (manager view).

### `unmount()`

- Close PowerSync watch subscriptions (`await activeWatch.close()`).
- Call `abortController.abort()` to remove all listeners registered with that signal.
- Call the function returned by `registerOnAccountSwitch()` to unregister.
- Clear module-level references (`db = null`, etc.).

Skipping cleanup causes duplicate event handlers or multiple live watches after several navigations.

## Adding a new view

Example: adding a **Settings** screen to the booking sidebar.

### 1. Add markup to the shell HTML

In [`booking/app.html`](../booking/app.html), add a container:

```html
<div id="view-settings" hidden>
    <h1>Booking settings</h1>
    <!-- settings UI -->
</div>
```

Update the inline flash-prevention script in `<head>` to handle the `settings` route segment.

### 2. Create the view module

`booking/views/settingsView.js`:

```javascript
let abortController = null;

const root = () => document.getElementById('view-settings');

export async function mountSettingsView(ctx) {
    abortController = new AbortController();
    const { signal } = abortController;
    // Wire UI using ctx.db, ctx.onNavigate, ctx.registerOnAccountSwitch
}

export async function unmountSettingsView() {
    abortController?.abort();
    abortController = null;
}
```

### 3. Register the route

In [`booking/router.js`](../booking/router.js):

- Add to `ROUTE_PATHS`: `settings: 'settings'`.
- Extend `BOOKING_ROUTE_RE` / `parseRouteFromLocation()` to detect `/booking/settings`.
- Add `settings: document.getElementById('view-settings')` to `viewContainers`.

In [`booking/app.js`](../booking/app.js):

```javascript
import { mountSettingsView, unmountSettingsView } from './views/settingsView.js';

// In createBookingRouter views map:
settings: { mount: mountSettingsView, unmount: unmountSettingsView },
```

### 4. Add sidebar entry

In [`ui/bookingSidebar.js`](../ui/bookingSidebar.js), add a route to the `ROUTES` array:

```javascript
{ name: 'settings', label: 'SETTINGS', className: 'booking-sidebar-nav-link--settings' },
```

Add CSS for the new modifier class in [`style.css`](../style.css) if needed.

### 5. Register the route for build and dev

In [`vite/bookingRoutePlugin.js`](../vite/bookingRoutePlugin.js), add `'settings'` to `BOOKING_SHELL_ROUTES` and extend `BOOKING_ROUTE_RE` to include `settings`. The plugin will emit `dist/booking/settings/index.html` and rewrite the path in dev.

### 6. Navigate from other views

```javascript
onNavigate?.('settings');
onNavigate?.('create', { edit: bookingId });
onNavigate?.('manager', { replace: true });  // replace history entry (no extra back step)
```

## Patterns to follow

### Scoped DOM queries

```javascript
// Good, scoped to the view
const form = root().querySelector('#bookingForm');

// Avoid, breaks when multiple views share the document
const form = document.getElementById('bookingForm');
```

### Account switch

When restaurant scope changes, views that query bookings should re-subscribe:

```javascript
unregisterAccountSwitch = ctx.registerOnAccountSwitch(() => {
    void subscribeBookings();
});
```

Bootstrap fans out account switches to all registered listeners.

### Programmatic navigation

Use `onNavigate` from `mount()` context instead of `window.location` for moves within the shell:

```javascript
onNavigate?.('manager');                    // after save
onNavigate?.('create', { edit: id });       // open edit form
```

### Shared database

Views receive `db` from bootstrap. Do **not** call `initDatabase()` again inside a view.

### Profile sync and the shell

Auth profile fetches use a 5-minute TTL in [`auth/profiles.js`](../auth/profiles.js) so repeated navigations inside the shell do not hit Supabase every time. Account switch, login, token refresh, and coming back online use `{ force: true }` to refresh when it matters. See [Authentication; Profiles and restaurant assignment](./authentication.html#profiles-and-restaurant-assignment).

## Testing checklist

When changing the shell or adding a view:

- [ ] Cold load each URL (`/booking/manager`, `/booking/create`, `/booking/walkin`, `/booking/metrics`, `/booking/tables`, `/booking/sync-status`) shows the correct view without flash.
- [ ] Sidebar switches views without full reload (Network tab: no new document request).
- [ ] Browser back/forward restores the correct view and URL.
- [ ] `/booking/create?edit=<id>` loads the form with booking data.
- [ ] Account switch refreshes manager list (restaurant scope).
- [ ] Navigate away from manager and back, no duplicate rows or duplicate click handlers.
- [ ] PowerSync watch is closed after leaving manager (no extra subscriptions in devtools/logging).

## Related docs

- [Architecture](./architecture.html) — project-wide layout and data flow
- [Database](./database.html) — PowerSync, watched queries, shell load order
- [Authentication](./authentication.html) — login, profiles, profile sync TTL
- [Deployment](./deployment.html) — adding HTML entries to the Vite build
