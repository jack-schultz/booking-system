# Deployment

The project deploys to **GitHub Pages** via `.github/workflows/deploy.yml`.

## How it works

On push to `main` or `dev`:

1. Check out both `main` and `dev` branches.
2. Run `npm ci` and `npm run build` on each (Vite bundles `@powersync/web`, workers, and WASM).
3. Copy `main/dist/*` into `public/`.
4. Copy `dev/dist/*` into `public/dev/`.
5. Publish `public/` to the `gh-pages` branch.

Production URL: `https://<username>.github.io/booking-system/`  
Dev preview: `https://<username>.github.io/booking-system/dev/`

PowerSync pages **must** be served from the Vite build output. Deploying raw source files causes bare import errors (`@powersync/web` not remapped).

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

## Branches

| Branch | Role |
|--------|------|
| `main` | Production site (root of GitHub Pages) |
| `dev` | Staging preview under `/dev/` |
| `gh-pages` | Auto-generated deploy branch (do not edit manually) |

## Environment and secrets

- Supabase URL and anon key are in `supabaseClient.js` (public by design).
- No GitHub secrets are required for the deploy workflow.
- When adding PowerSync Cloud, store the PowerSync endpoint URL in config; JWTs come from Supabase at runtime.

## Manual deploy trigger

The workflow supports `workflow_dispatch` — run it manually from the Actions tab on GitHub.
