# Deployment

The project deploys to **GitHub Pages** and **bunny.net** via [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## How it works

On push to `main` or `dev`:

1. Check out both `main` and `dev` branches (always the latest tip of each — not only the branch that was pushed).
2. Run `npm ci` and `npm run build` on each branch twice — once per deploy target (different `VITE_BASE_PATH` values).
3. Copy build outputs into `public/` (GitHub Pages) and `bunny-public/` (bunny.net).
4. Publish `public/` to the `gh-pages` branch.
5. Upload `bunny-public/` to bunny.net Storage and purge the Pull Zone cache.

### GitHub Pages URLs

Production URL: `https://<username>.github.io/booking-system/`  
Dev preview: `https://<username>.github.io/booking-system/dev/`

Docs on the live site:

| Environment | Docs URL |
|-------------|----------|
| Production (`main`) | `https://<username>.github.io/booking-system/docs/` |
| Dev preview (`dev`) | `https://<username>.github.io/booking-system/dev/docs/` |

### Bunny.net URLs

Production is served at your **custom domain root** (e.g. `https://bookings.yourdomain.com/`).  
Dev preview is under `/dev/` on the same domain (e.g. `https://bookings.yourdomain.com/dev/`).

| Environment | App URL | Docs URL |
|-------------|---------|----------|
| Production (`main`) | `https://bookings.yourdomain.com/login.html` | `https://bookings.yourdomain.com/docs/` |
| Dev preview (`dev`) | `https://bookings.yourdomain.com/dev/login.html` | `https://bookings.yourdomain.com/dev/docs/` |

Replace `bookings.yourdomain.com` with your actual custom hostname.

### What actually lands on `gh-pages`

The workflow **never** copies source files from the repo root (`docs/`, `booking/`, etc.) directly. It only publishes the Vite build output in `dist/`.

| Source in the repo | On `gh-pages` after deploy? |
|--------------------|----------------------------|
| `docs/index.html` (source) | No — only if built into `dist/docs/index.html` |
| `dist/docs/index.html` (build output) | Yes — at `/booking-system/docs/index.html` |
| Files not listed in `vite.config.js` `build.rollupOptions.input` | No |

PowerSync app pages **must** be served from the Vite build output. Deploying raw source files causes bare import errors (`@powersync/web` not remapped). The same rule applies to documentation: doc HTML shells and their JS/CSS are bundled by Vite; markdown sources are copied into `dist/docs/` by a build plugin.

### How documentation is built

Each doc page is a small HTML shell in `docs/` that loads markdown at runtime via `docs/docs.js` (using [marked](https://marked.js.org/) from a CDN).

During `npm run build`, Vite:

1. Bundles each `docs/*.html` entry listed in `vite.config.js` → `dist/docs/*.html` (with hashed assets under `dist/assets/`).
2. Runs the `copyDocsMarkdown` plugin, which copies every `docs/*.md` file → `dist/docs/*.md`.

The sidebar is driven by the `DOC_PAGES` array in `docs/docs.js`. A new `.md` file alone is **not** enough for deployment — you must register it in all three places described below.

## Base path

Each deploy target bakes a different base path into asset URLs and the PWA service worker. The workflow sets `VITE_BASE_PATH` during build:

| Branch | GitHub Pages `VITE_BASE_PATH` | Bunny.net `VITE_BASE_PATH` |
|--------|-------------------------------|----------------------------|
| `main` | `/booking-system/` | `/` |
| `dev` | `/booking-system/dev/` | `/dev/` |

Local dev uses `/` by default (`npm run dev`).

## Local production preview

Test the GitHub Pages build locally:

```bash
VITE_BASE_PATH=/booking-system/ npm run build
npm run preview
```

Open http://localhost:4173/booking-system/login.html

Test the bunny.net (custom domain root) build locally:

```bash
VITE_BASE_PATH=/ npm run build
npm run preview
```

Open http://localhost:4173/login.html

## Adding a new documentation page

Use an existing page such as `docs/getting-started.html` as a template. For a page titled **"API reference"** with slug `api-reference`:

### 1. Add the markdown source

Create `docs/api-reference.md` with your content. Link to other docs using `.html` paths with heading anchors (e.g. `[Deployment](./deployment.html)` or `[Troubleshooting](./powersync-supabase.html#troubleshooting)`). Anchors are generated from heading text in `docs/docs.js` (GitHub-style slugs).

### 2. Add the HTML shell

Create `docs/api-reference.html` — copy any sibling page and change:

- The `<title>` in `<head>`
- The `initDocPage(...)` call at the bottom:

```html
<script type="module">
    import { initDocPage } from './docs.js';
    initDocPage('./api-reference.md', 'API reference');
</script>
```

### 3. Register the page in `docs/docs.js`

Add an entry to `DOC_PAGES` (controls the sidebar and page title):

```js
{ slug: 'api-reference', title: 'API reference', md: 'api-reference.md' },
```

### 4. Register the HTML entry in `vite.config.js`

Add a build input so Vite emits `dist/docs/api-reference.html`:

```js
docsApiReference: resolve(__dirname, 'docs/api-reference.html'),
```

Place it alongside the other `docs*` entries in `build.rollupOptions.input`. The `copyDocsMarkdown` plugin already copies **all** `docs/*.md` files automatically — no change needed there.

### 5. Link from other docs (optional)

Add a row to the table in `docs/index.md` or cross-link from related pages.

### 6. Verify locally, then merge to `main`

```bash
VITE_BASE_PATH=/booking-system/ npm run build
ls dist/docs/api-reference.html dist/docs/api-reference.md
npm run preview
```

Open http://localhost:4173/booking-system/docs/api-reference.html

The workflow builds `main` and `dev` independently. Production docs come from **`main/dist`**, so new pages must be merged into `main` (not only `dev`) to appear at `/booking-system/docs/`.

## Adding a new app page (non-docs)

For HTML pages that use PowerSync or other bundled modules (e.g. a new file under `booking/`):

1. Create the `.html` page (and any JS it imports).
2. Add it to `build.rollupOptions.input` in `vite.config.js` (same pattern as `bookingApp`, `metrics`, `tables`, etc.).
3. Run `VITE_BASE_PATH=/booking-system/ npm run build` and confirm the file exists under `dist/`.
4. Merge to `main` for production.

**Booking shell routes** (`/booking/manager`, `/booking/create`, `/booking/walkin`) are not separate HTML files. They share [`booking/app.html`](../booking/app.html); [`vite/bookingRoutePlugin.js`](../vite/bookingRoutePlugin.js) emits static `index.html` copies at build time and rewrites paths in dev. To add a new shell route, extend the plugin, router, and shell markup — see [Booking shell; Adding a new view](./booking-shell.html#adding-a-new-view).

Doc pages and app pages share the same deployment path: **source → Vite build → `dist/` → `gh-pages`**.

## Branches

| Branch | Role |
|--------|------|
| `main` | Production site (root of GitHub Pages) |
| `dev` | Staging preview under `/dev/` |
| `gh-pages` | Auto-generated deploy branch (do not edit manually) |

Pushing to either `main` or `dev` triggers a full redeploy of **both** environments. Do not commit to `gh-pages` by hand — the next workflow run will overwrite it.

## Environment and secrets

Supabase URL, anon key, and PowerSync endpoint URL are public client-side config values.

| Context | Where to set |
|---------|----------------|
| Local dev | Copy `.env.example` → `.env` |
| CI build (GitHub Pages + bunny.net) | **Repository secrets**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POWERSYNC_URL`, `VITE_DEMO_EMAIL`, `VITE_DEMO_PASSWORD` |

**Important:** The deploy workflow reads **repository** secrets (`Settings → Secrets and variables → Actions → Repository secrets`).

**`VITE_POWERSYNC_URL`:** Copy from PowerSync Dashboard → select your instance → **Connect** → instance URL (e.g. `https://xxxxxxxx.powersync.journeyapps.com`). Not the dashboard URL and not Supabase.

PowerSync authentication uses the user's Supabase JWT at runtime — no separate PowerSync secret is needed in the frontend.

## Bunny.net setup (one-time, outside the repo)

Complete these steps in the [bunny.net dashboard](https://bunny.net) before the first bunny deploy can succeed.

### 1. Storage Zone

1. **Storage → Add Storage Zone**
2. Name the zone (e.g. `booking-system`) and pick the region closest to your users.
3. On **FTP & API Access**, copy the **Storage Zone Password** (upload `AccessKey`).
4. Note the regional storage endpoint (e.g. `https://storage.bunnycdn.com`, `https://syd.storage.bunnycdn.com`).

### 2. Pull Zone

1. **CDN → Add Pull Zone**
2. Set **Origin Type** to **Storage Zone** and select the zone from step 1.
3. Copy the **Pull Zone ID** from the zone overview (needed for cache purge in CI).

### 3. Custom domain and SSL

1. In the Pull Zone, **Hostnames → Add Custom Hostname** (e.g. `bookings.yourdomain.com`).
2. Add the DNS record bunny shows (typically a **CNAME** to `*.b-cdn.net`).
3. Enable **Force SSL** — bunny provisions a Let's Encrypt certificate after DNS propagates.

Dev preview uses `/dev/` on the same domain; a separate hostname is optional.

### 4. CDN behavior

This app is a multi-page site (not a client-side router SPA). [`vite/bookingRoutePlugin.js`](../vite/bookingRoutePlugin.js) emits static `index.html` files for `/booking/manager`, `/booking/create`, etc., so SPA-style 404 → `index.html` fallback is not required.

Recommended Pull Zone settings:

- Enable Brotli/Gzip compression.
- Long cache for hashed assets under `/assets/`; shorter cache or bypass for `sw.js`, `manifest.webmanifest`, and HTML if you want faster deploy visibility.

### 5. Account API key (cache purge)

1. **Account → API** → generate an API key with permission to purge Pull Zones.
2. Store separately from the Storage Zone Password.

### 6. GitHub repository secrets for bunny.net

Add under **Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Purpose |
|--------|---------|
| `BUNNY_STORAGE_ZONE_NAME` | Storage zone name |
| `BUNNY_STORAGE_ZONE_PASSWORD` | Storage zone password (upload AccessKey) |
| `BUNNY_STORAGE_ENDPOINT` | Regional endpoint URL, e.g. `https://storage.bunnycdn.com` |
| `BUNNY_API_KEY` | Account API key for Pull Zone purge |
| `BUNNY_PULL_ZONE_ID` | Numeric Pull Zone ID |

If any bunny secret is missing, the workflow still deploys to GitHub Pages and skips the bunny.net upload with a warning.

## Verification checklist

After the first successful deploy:

1. **Bunny production:** `https://bookings.yourdomain.com/login.html` loads; no 404s under `/assets/`.
2. **Booking routes:** `/booking/manager`, `/booking/create`, etc. work.
3. **Bunny dev:** `https://bookings.yourdomain.com/dev/login.html` works.
4. **PWA:** `sw.js` and `manifest.webmanifest` load; service worker registers (DevTools → Application).
5. **Supabase login:** sign in redirects to `/booking/manager` and sync connects when online.
6. **GitHub Pages unchanged:** `https://<username>.github.io/booking-system/login.html` still works.
7. **Cache:** after a second deploy, changed files appear within ~1 minute (purge step working).

## Manual deploy trigger

The workflow supports `workflow_dispatch` — run it manually from the Actions tab on GitHub.
