# AlertCheck Architecture Decisions

## ADR-001 — Deterministic verification is the baseline

**Decision:** The core verifier uses explicit structured facts and deterministic rules; no external AI is required.

**Reason:** Repeatability, testability, low operational cost, and graceful operation without inference services matter more than speculative semantic coverage.

**Trade-off:** Arbitrary natural-language translation cannot be certified; uncertain variants require human review.

**Revisit when:** A measurable evaluation dataset exists and a proposed model can demonstrate a clear, safe benefit without making the basic flow unavailable.

## ADR-002 — Share one verifier between browser and Worker

**Decision:** Keep shared rules in `shared/verification-core` and import them from both the frontend and backend.

**Reason:** Prevents rule drift and enables browser fallback when the backend is unreachable.

**Trade-off:** Builds and workspace configuration must ensure the shared package compiles before consumers resolve its package exports.

## ADR-003 — No database in the initial version

**Decision:** Do not persist warnings centrally; use local state and fictional presets.

**Reason:** Keeps setup and hosting simple and avoids central storage of potentially sensitive drafts.

**Revisit when:** A verified user need for shared review history or collaborative approval is demonstrated.

## ADR-004 — Static frontend hosting and edge API

**Decision:** Use Cloudflare Pages for the frontend and Cloudflare Workers for the optional HTTP API, with deterministic browser fallback.

**Reason:** The project can remain usable on free-tier hosting and does not depend on a continuously running personal machine.

**Trade-off:** Free-tier quotas and provider availability still apply to the hosted API; browser fallback is therefore part of the product, not an optional convenience.

## ADR-005 — Human review remains mandatory

**Decision:** The tool flags potential issues and explains evidence; it never approves an emergency warning for publication.

**Reason:** The current deterministic checks do not prove semantic completeness or operational correctness.
