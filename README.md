# AlertCheck

**A deterministic, offline-capable aid for checking critical information in emergency-warning variants.**

AlertCheck helps a human reviewer compare a structured master warning with a translated or channel-adapted candidate and identify supported discrepancies—such as missing locations, changed deadlines or numbers, missing actions, reversed prohibitions, or message-length violations.

> **Safety note:** AlertCheck is an experimental verification aid, not an official emergency-warning authority or dispatch system. `no_mismatch_detected` means only that the implemented checks did not identify a mismatch. Qualified human review is required before real-world publication.

## Problem statement

When emergency warnings are translated, shortened, or reformatted, safety-critical facts can be accidentally omitted or changed. AlertCheck checks approved variants against a structured source of truth so that potential inconsistencies can be reviewed before publication.

## Core architecture

- **Frontend:** React, TypeScript, Vite and Tailwind CSS in `frontend/`.
- **Backend:** Cloudflare Worker API in `backend/`.
- **Shared verifier:** deterministic TypeScript rules in `shared/verification-core/`.
- **Architecture and rulesets:** project constraints, verification rules, API contract, safety limitations, tests, and deployment instructions in `architecture/`.
- **Diffs and migration notes:** folder reorganization record in `diff/`.

Frontend and backend use the same verification-core package. If the Worker is unavailable, the frontend can run the deterministic engine locally and label the result as browser-local verification.

## Repository structure

```text
alertcheck/
├── architecture/             # Source-of-truth project rules and technical contracts
├── frontend/                 # React + Vite user interface
├── backend/                  # Cloudflare Worker API
├── shared/
│   └── verification-core/    # Shared validators, types, templates, tests
├── diff/                     # Reorganization patch and file move notes
├── .github/workflows/ci.yml  # Automated checks
├── package.json              # Root npm workspaces and commands
└── README.md
```

Read [Architecture & Project Rules](architecture/README.md) before changing verification behaviour.

## Requirements

- Node.js 20 or newer
- npm

No external AI API, database, custom-trained model, or paid service is required for the core workflow.

## Local setup

Install dependencies from the repository root:

```bash
npm install
```

Run checks:

```bash
npm run typecheck
npm run test
npm run build
```

Start the API and frontend in separate terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Default development URLs are expected to be `http://localhost:8787` for the Worker and `http://localhost:5173` for Vite.

## Common commands

| Command | Purpose |
|---|---|
| `npm run typecheck` | Type-check the shared package and apps; builds shared declarations first |
| `npm run test` | Run shared-core, backend, and frontend tests |
| `npm run build` | Build the shared package, backend check, and frontend production bundle |
| `npm run build:frontend` | Build shared core and frontend for Pages |
| `npm run build:backend` | Build shared core and type-check backend |
| `npm run dev:frontend` | Start Vite development server |
| `npm run dev:backend` | Start Wrangler Worker development server |
| `npm run deploy:backend` | Build shared core and deploy the Worker |

## Verification rules and limitations

- The verifier uses deterministic rules; it does not understand every possible natural-language expression.
- Hindi demonstration variants require human review. Do not treat template output as approved translation.
- The template renderer must not silently remove facts to satisfy message-length limits.
- Reports carry evidence for findings where available.
- The absence of findings does not prove a warning is correct or safe.
- All demo warnings are fictional.

See [the complete verification ruleset](architecture/VERIFICATION_RULESET.md) and [limitations](architecture/VERIFICATION_LIMITATIONS.md).

## API

- `GET /api/health` — Worker health check.
- `POST /api/verify` — validate a JSON verification request and return a structured report.

See [API Contract](architecture/API_CONTRACT.md) for request and response details.

## Deployment

See [Deployment Guide](architecture/DEPLOYMENT_GUIDE.md). The frontend build must build `shared/verification-core` first; use `npm run build:frontend` and set Pages output to `frontend/dist`. Deploy the Worker with `npm run deploy:backend` after Cloudflare authentication.

## Project rules

The source-of-truth rules are in `architecture/PROJECT_RULES.md`. Update rules, tests, and implementation together when behaviour changes.

## License

Apache-2.0. See the license terms of each direct and transitive dependency before redistributing a release.
