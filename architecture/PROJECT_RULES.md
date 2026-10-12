# AlertCheck Project Rules

**Status:** Current project constraints  
**Applies to:** Frontend, backend, shared verifier, tests, and deployment

## 1. Product scope

AlertCheck helps a human reviewer check whether structured, approved emergency-warning information remains present and consistent across warning variants. It is an experimental verification aid, not an official warning authority or alert-dispatch service.

### AC-PROD-001 — Keep the scope narrow

The primary workflow is: define a structured master warning, render or edit a candidate variant, validate the variant, and inspect an evidence-backed report.

### AC-PROD-002 — Do not silently remove safety facts

The system must never silently remove an affected location, deadline, required action, prohibition, contact number, or other declared critical fact to meet a target message length. If a format cannot preserve the required facts within its limit, show a finding for human review.

### AC-PROD-003 — Human approval is required

AlertCheck does not authorize emergency messages for publication. No automated status is a substitute for approval by a designated and qualified human.

### AC-PROD-004 — Be honest about language support

The deterministic engine is not a general-purpose translation-verification system. It may flag supported patterns and explicit facts, but it cannot certify that arbitrary translations are semantically equivalent, culturally appropriate, or complete.

## 2. Determinism and correctness

### AC-CORE-001 — Deterministic core

Core verification must run without an external AI provider, database, account, or paid service. The same request should produce the same substantive findings in browser and Worker modes; time-dependent report metadata may differ.

### AC-CORE-002 — One shared implementation

Frontend and backend must call `shared/verification-core`. Do not fork or duplicate verifier rules in the frontend or Worker.

### AC-CORE-003 — Findings need evidence

Every finding must explain what was checked and provide relevant source/candidate evidence when available. Never invent text evidence or fabricate a successful check.

### AC-CORE-004 — Treat uncertainty explicitly

If the engine cannot determine whether a critical meaning is preserved, return or include `needs_review` rather than claiming equivalence.

### AC-CORE-005 — No model claims without a model

Do not label any report as AI-verified unless an AI provider was actually invoked and its result was separately validated. The current baseline is deterministic and rule-based.

## 3. Privacy and security

### AC-SEC-001 — No persistence by default

Do not permanently store warning text. Do not introduce analytics or logging that captures submitted warning bodies by default.

### AC-SEC-002 — No secrets in client code

Never place private keys, tokens, or credentials in frontend source, committed configuration, fixtures, screenshots, or Git history. Frontend `VITE_*` values are public build-time values and must not contain secrets.

### AC-SEC-003 — Validate requests

The backend must validate request content type, JSON parsing, body size, and the shared domain schema before verification.

### AC-SEC-004 — Safe errors

Return understandable structured errors. Do not expose internal stack traces, credentials, or environment values to clients.

### AC-SEC-005 — Least data necessary

Use fictional samples in tests and public demos. Avoid sending real, unreleased, sensitive emergency drafts to third-party services.

## 4. Availability and cost

### AC-AVAIL-001 — Basic verification cannot depend on cloud AI

No external AI or inference service is required for the product's core checks.

### AC-AVAIL-002 — Browser fallback

If the backend is unreachable, the frontend must be able to run the shared deterministic verifier locally and must label the report as browser-local verification.

### AC-AVAIL-003 — Free-tier baseline

The initial public application should use free-tier static hosting and a free-tier Worker where needed. A database, paid service, or always-on local computer must not be required for the core workflow.

### AC-AVAIL-004 — Do not overclaim offline support

Browser-based local verification and reopening the application offline are different capabilities. Claim full offline reopening only if the deployed service worker and required assets have been tested from a cold/offline browser session.

## 5. Engineering rules

- Keep `frontend/`, `backend/`, and `shared/verification-core/` responsibilities separate.
- Keep reusable domain types in the shared package.
- Keep endpoint handlers small; call shared validation rather than reimplementing it.
- Add regression tests for every corrected bug, especially false negatives and false positives.
- Do not weaken a test simply because the current implementation fails it.
- Avoid adding packages, databases, AI, authentication, or configuration when the current scope does not require them.
- Mark all synthetic warnings as fictional.
- Update the README and relevant `architecture/` documents when behaviour changes.
