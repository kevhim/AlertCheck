# AlertCheck Deployment Guide

AlertCheck is designed to deploy on **100% free-tier cloud infrastructure** using Cloudflare Pages for the frontend and Cloudflare Workers for the backend API.

---

## 1. Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher (v24 tested)
- npm v10 or higher
- A free [Cloudflare Account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (bundled in backend dependencies)

---

## 2. Local Development Setup

To run both services locally on your development machine:

```bash
# 1. Clone repository and navigate to root
cd alertsystem

# 2. Install monorepo dependencies
npm install

# 3. Build shared verification engine
npm run --workspace=@alertcheck/verification-core build

# 4. In Terminal 1: Start backend Cloudflare Worker
npm run --workspace=@alertcheck/backend dev
# Worker will start on http://localhost:8787

# 5. In Terminal 2: Start frontend Vite dev server
npm run --workspace=@alertcheck/frontend dev
# Frontend will open on http://localhost:5173
```

---

## 3. Backend Deployment: Cloudflare Workers

The backend is an edge worker located in `apps/backend/`.

### Step-by-Step Deployment:

1. **Authenticate Wrangler with Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Configure wrangler.jsonc**:
   Review `apps/backend/wrangler.jsonc`:
   ```jsonc
   {
     "name": "alertcheck-api",
     "main": "src/index.ts",
     "compatibility_date": "2025-01-01",
     "vars": {
       "ALLOWED_ORIGIN": "https://alertcheck.pages.dev"
     }
   }
   ```
   *(Update `ALLOWED_ORIGIN` to your deployed Cloudflare Pages URL once available).*

3. **Deploy Worker**:
   ```bash
   npm run --workspace=@alertcheck/backend deploy
   ```
   Wrangler will output your live API endpoint, for example:
   ```
   https://alertcheck-api.<your-subdomain>.workers.dev
   ```

4. **Verify Live Deployment**:
   ```bash
   curl https://alertcheck-api.<your-subdomain>.workers.dev/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "alertcheck-api",
     "version": "1.0.0",
     "engine": "deterministic-rule-based",
     "offlineCapable": true,
     "requiresAiKey": false
   }
   ```

---

## 4. Frontend Deployment: Cloudflare Pages

The frontend is a single-page React application located in `apps/frontend/`.

### Deployment Option A: Connect via Cloudflare Dashboard (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages > Pages**.
2. Click **Connect to Git** and select your GitHub repository.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `.` (leave as root)
   - **Build command**: `npm run --workspace=@alertcheck/frontend build`
   - **Build output directory**: `apps/frontend/dist`
4. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://alertcheck-api.<your-subdomain>.workers.dev`
5. Click **Save and Deploy**.

### Deployment Option B: Direct CLI Deployment via Wrangler

You can also deploy directly from your local terminal:

```bash
# 1. Build the frontend production bundle
npm run --workspace=@alertcheck/frontend build

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy apps/frontend/dist --project-name=alertcheck
```

---

## 5. Offline Capabilities Verification

Once deployed, you can verify AlertCheck's offline resilience:
1. Open the deployed Cloudflare Pages site in Google Chrome or Firefox.
2. Load any fictional preset warning in the interface.
3. Open Developer Tools (`F12`), navigate to the **Network** tab, and toggle **Offline**.
4. In the UI, click **Verify Message Integrity**.
5. Observe that the verification runs instantly using the browser's local engine, displaying the **Browser Local Engine (Offline Fallback)** badge with identical factual audit findings!

---

## 6. Continuous Integration (GitHub Actions)

The `.github/workflows/ci.yml` pipeline automatically triggers on push and pull request to `main`:
- Checks TypeScript types across all packages (`npm run typecheck`)
- Executes the full 33-test suite across engine, backend, and frontend (`npm run test`)
- Validates production bundle compilation (`npm run build`)
