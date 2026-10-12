# AlertCheck Reorganization Summary

## Goals

1. Put authoritative product/engineering rules in one `architecture/` folder.
2. Make frontend, backend, and shared verification code obvious at the repository root.
3. Keep the code and rule sets separate but linked by documentation.
4. Keep all source under version control while excluding generated dependencies and build outputs from the deliverable ZIP.
5. Ensure clean hosting builds compile the shared package before consumers rely on its `dist/` exports.

## What changed

- Moved `apps/frontend/` to `frontend/`.
- Moved `apps/backend/` to `backend/`.
- Moved `packages/verification-core/` to `shared/verification-core/`.
- Moved and consolidated the former `docs/` guidance under `architecture/`.
- Added the project ruleset, verification ruleset, API contract, test strategy, decision log, and an architecture index.
- Updated npm workspace paths and package-lock workspace links.
- Updated frontend/backend TypeScript base-config paths.
- Updated the Vite alias to the new shared package source location.
- Added explicit root scripts for frontend build, backend build, and Worker deployment. Root typecheck/test commands build the shared package first to make clean-checkout workflows reliable.
- Rewrote the README to match the new structure and commands.
- Corrected `.env.example` comments to distinguish public build-time values from Worker runtime configuration.

## Behaviour intended to remain unchanged

The existing UI, deterministic validation logic, API handlers, demonstration samples, and tests were moved rather than redesigned. Verification rules and statuses remain owned by `shared/verification-core`.

## Validation performed in this environment

- `npm run typecheck`: passed for all three workspaces.
- Full test/build recheck: could not be completed because the ZIP contained Windows-oriented `node_modules`; Linux's Rollup optional dependency was absent. A clean install was attempted but the package registry was unreachable (`EAI_AGAIN`). The output ZIP therefore excludes all `node_modules` and generated build output; a normal `npm ci` on the target machine should install platform-appropriate dependencies.

The included project does not claim live Cloudflare deployment has been performed. GitHub remotes, Cloudflare authentication, and account-level deployment remain the user's actions.
