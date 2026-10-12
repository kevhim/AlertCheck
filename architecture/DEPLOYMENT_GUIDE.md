# AlertCheck Deployment Guide

AlertCheck is a monorepo with a static React frontend, a Cloudflare Worker API, and a shared deterministic package. The public site does not require your development computer to remain on.

## 1. Prerequisites

- Node.js 20 or newer
- npm compatible with the lockfile
- A GitHub account for source control
- A Cloudflare account for Pages and Workers deployment
- Cloudflare Wrangler CLI (installed as a backend workspace dependency)

## 2. Install and verify locally

Run from the repository root:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Start the Worker and frontend in two terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

The expected local ports are Worker `http://localhost:8787` and Vite `http://localhost:5173` unless their configurations change.

## 3. Deploy backend Worker

The shared package must be built before deploying the Worker. The root command does this:

```bash
npx wrangler login
npm run deploy:backend
```

The command runs the shared verification-core build and then invokes the backend workspace's Wrangler deploy script.

Review `backend/wrangler.jsonc` before deployment. Configure `ALLOWED_ORIGIN` to the exact production frontend origin. Do not leave a localhost origin in production, and do not use a wildcard where a specific origin is known.

After deployment, use the URL Wrangler reports to test:

```bash
curl https://YOUR-WORKER.workers.dev/api/health
```

Then send a fictional test request to `/api/verify` and confirm the response shape and CORS behaviour.

## 4. Deploy frontend to Cloudflare Pages

Connect the GitHub repository to Cloudflare Pages. Because the monorepo uses a shared package, use the repository root as the build root.

Recommended settings:

- **Root directory:** `/` or repository root (`.`), depending on the Dashboard wording
- **Build command:** `npm run build:frontend`
- **Build output directory:** `frontend/dist`
- **Environment variable:** `VITE_API_BASE_URL=https://YOUR-WORKER.workers.dev`

`build:frontend` builds `shared/verification-core` first, then builds the Vite frontend. This is important for clean cloud builds where generated `dist/` folders are not checked into Git.

If you intentionally deploy frontend without a Worker, omit the API URL and confirm the current frontend service falls back to browser-local verification. The UI must accurately label the mode.

## 5. Validate the deployed app

From a browser on another device, test:

1. Frontend loads successfully.
2. `GET /api/health` works.
3. A fictional clean warning can be checked.
4. A changed deadline is flagged.
5. An omitted affected area or altered contact detail is flagged where supported.
6. A reversed prohibition example is flagged where supported.
7. Long SMS content triggers a length finding.
8. The report can be exported.
9. Blocking or misconfiguring the Worker triggers browser-local fallback.
10. The displayed verification mode is accurate.

Do not use real emergency messages to test the public deployment.

## 6. GitHub CI

The workflow in `.github/workflows/ci.yml` runs on push and pull request. It installs dependencies, runs type checks, runs tests, and builds the monorepo. Confirm the workflow passes after publishing the repository.

## 7. Free-tier and uptime notes

This setup is designed to keep the basic application low-cost and independent of a hosted AI API. Free-tier quotas, provider outages, account status, build limits, and service terms can still affect availability. The browser's deterministic path must remain functional when the Worker is unreachable.
