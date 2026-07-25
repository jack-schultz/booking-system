# Deployment

The project deploys to **GitHub Pages** via `.github/workflows/deploy.yml`.

## How it works

On push to `main` or `dev`:

1. Check out both `main` and `dev` branches (always the latest tip of each — not only the branch that was pushed).
2. Run `npm ci` and `npm run build` on each (Vite bundles `@powersync/web`, workers, and WASM).
3. Copy `main/dist/*` into `public/`.
4. Copy `dev/dist/*` into `public/dev/`.
5. Publish `public/` to the `gh-pages` branch.

Production URL: `https://<username>.github.io/booking-system/`  
Dev preview: `https://<username>.github.io/booking-system/dev/`

Docs on the live site:

| Environment | Docs URL |
|-------------|----------|
| Production (`main`) | `https://<username>.github.io/booking-system/docs/` |
| Dev preview (`dev`) | `https://<username>.github.io/booking-system/dev/docs/` |

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

GitHub Pages serves this repo under `/booking-system/`. The workflow sets `VITE_BASE_PATH` during build:

| Branch | `VITE_BASE_PATH` |
|--------|------------------|
| `main` | `/booking-system/` |
| `dev` | `/booking-system/dev/` |

Local dev uses `/` by default (`npm run dev`).

## Local production preview

Test the GitHub Pages build locally:

```bash
VITE_BASE_PATH=/booking-system/ npm run build
npm run preview
```

Open http://localhost:4173/booking-system/login.html

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

Supabase URL, anon key, and PowerSync endpoint URL are public client-side config values. Set them in:

| Context | Where to set |
|---------|----------------|
| Local dev | Copy `.env.example` → `.env` |
| GitHub Pages build | **Repository secrets**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_POWERSYNC_URL` |

**Important:** The deploy workflow reads **repository** secrets (`Settings → Secrets and variables → Actions → Repository secrets`).

**`VITE_POWERSYNC_URL`:** Copy from PowerSync Dashboard → select your instance → **Connect** → instance URL (e.g. `https://xxxxxxxx.powersync.journeyapps.com`). Not the dashboard URL and not Supabase.

PowerSync authentication uses the user's Supabase JWT at runtime — no separate PowerSync secret is needed in the frontend.

## Manual deploy trigger

The workflow supports `workflow_dispatch` — run it manually from the Actions tab on GitHub.
