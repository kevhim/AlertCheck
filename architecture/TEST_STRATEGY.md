# AlertCheck Test Strategy

## Goals

Tests must show that the system catches the specifically supported discrepancies, fails safely on invalid input, and does not claim more than the rules prove.

## Layers

### Shared verification core

- Unit-test each extractor and validator independently.
- Test the orchestrator's overall status and finding aggregation.
- Include both positive cases and false-positive/false-negative edge cases.
- Keep fixtures fictional, deterministic, and small.

### Backend

- Test `/api/health` and `/api/verify` through the Worker fetch handler.
- Test content-type checks, empty bodies, malformed JSON, body-size limits, and safe error responses.
- Test allowed-origin and preflight behaviour.

### Frontend

- Test rendering and basic workflow interactions.
- Test Worker-success behaviour and local fallback on HTTP failure, timeout, or network exception.
- Confirm mode labels accurately distinguish Worker verification from browser-local verification.

### End-to-end smoke tests

Before release, manually or automatically verify:

1. The app loads from its deployed URL on another device/browser.
2. A clean fictional sample can be checked.
3. Altering a deadline is reported.
4. Removing a location is reported where supported.
5. Removing or reversing a known prohibition is reported where supported.
6. The report downloads successfully.
7. Backend failure triggers the browser fallback with a visible status.
8. The app never labels a clean rule result as a certification of safety.

## Commands

Run from the repository root:

```bash
npm run typecheck
npm run test
npm run build
```

The core package must be built before workspace typechecks/tests that resolve its package exports. Root scripts enforce that prerequisite.

## Honest reporting

Do not record tests as passed unless they were executed. When a test is skipped or cannot run, say so explicitly. A passing suite measures covered cases only; it is not proof of completeness or production safety.
