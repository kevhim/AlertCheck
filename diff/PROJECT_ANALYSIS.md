# AlertCheck Source Review — Findings from the Uploaded ZIP

## Existing strengths preserved

- Clear separation already existed between React UI, Worker handlers, and shared deterministic verification logic.
- The same `verifyWarning` implementation is intended for browser fallback and Worker execution.
- Verification domain types are explicit, and the rule engine covers locations, deadlines, quantities/contact digits, required actions, prohibitions, validity fields, and channel length.
- Test files already cover the core validators and the frontend/backend integration surfaces.
- The project already includes a CI workflow, service-worker assets, deployment notes, and an explicit safety limitations document.

## Structure problems found

1. **Guidance was spread across `docs/` and code folders.** There was no single authoritative place to find product boundaries, verification semantics, API contracts, and safety rules.
2. **Implementation folders were nested under `apps/` and `packages/`.** This is a standard monorepo convention, but the requested repository layout calls for obvious top-level `frontend/`, `backend/`, and shared code folders.
3. **Deployment build ordering needed to be explicit.** The shared package's `package.json` points its public exports to generated `dist/` files. A clean Pages or Worker deployment must build the shared package before typechecking/bundling a consumer. The previous frontend deployment command did not make that prerequisite clear.
4. **Root typecheck/test commands did not explicitly build the shared package first.** They relied on generated artifacts being present in the development ZIP. Root scripts now build shared output first.
5. **The uploaded ZIP included generated and machine-specific dependencies.** It was about 87 MB, with a large `node_modules/` tree and generated Worker/build artifacts. Those are excluded from the reorganized source ZIP; `package-lock.json` remains.
6. **Environment example names were not aligned with Worker configuration.** The sample referred to `FRONTEND_ORIGIN`, while the Worker reads `ALLOWED_ORIGIN`. The example now documents the actual variable name and clarifies that it is not automatically loaded by both tools.

## Changes made

- Flattened the app layout to `frontend/` and `backend/`.
- Moved the shared package to `shared/verification-core/`.
- Consolidated project rules and design docs under `architecture/`.
- Added explicit rule precedence and stable references for product constraints, verification semantics, API request/response expectations, test strategy, and key architecture decisions.
- Updated npm workspaces, package-lock workspace mappings, Vite alias, and TypeScript config extends paths.
- Added root scripts for `build:frontend`, `build:backend`, and `deploy:backend`.
- Rewrote the root README and deployment guide to match the new structure.
- Stored the move map, human summary, Git move summary, and patch under `diff/`.

## Validation evidence and limitations

- `npm run typecheck` passed for `shared/verification-core`, `backend`, and `frontend` in the current container after using the dependencies bundled in the uploaded ZIP.
- `npm run build:backend` passed (shared package build plus backend TypeScript build).
- Frontend TypeScript typecheck passed.
- Full Vitest and Vite production build could not be re-run in this Linux container because the ZIP's `node_modules` lacked `@rollup/rollup-linux-x64-gnu`, the platform-specific optional dependency expected by Rollup. A clean `npm ci` was attempted, but access to `registry.npmjs.org` failed with `EAI_AGAIN`. The final ZIP intentionally excludes `node_modules`; install from `package-lock.json` on the development machine or CI to get correct platform-specific dependencies.
- No GitHub push or Cloudflare deployment was performed. Live deployment still requires the user's account authentication and final origin configuration.

## Items to verify after extraction

1. Run `npm ci` on the development machine.
2. Run `npm run typecheck`, `npm run test`, and `npm run build`.
3. Confirm Pages uses `npm run build:frontend` and publishes `frontend/dist`.
4. Set the Worker `ALLOWED_ORIGIN` to the deployed frontend's exact origin.
5. Deploy and test `/api/health` and `/api/verify` from the real public site.
6. Verify cold-start offline behavior before describing the app as fully offline-capable.
