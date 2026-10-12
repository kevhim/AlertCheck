# AlertCheck Architecture & Project Rules

This folder is the project's source of truth for its purpose, system boundaries, verification behaviour, safety requirements, API contract, tests, and deployment.

## Rule precedence

When guidance conflicts, follow this order:

1. **`PROJECT_RULES.md`** — non-negotiable product, privacy, and safety rules.
2. **`VERIFICATION_RULESET.md`** — what the verifier is allowed to conclude and how findings are classified.
3. **`API_CONTRACT.md`** — stable requests, responses, and endpoint behaviour.
4. **`SYSTEM_ARCHITECTURE.md`** — module boundaries and data flow.
5. **`TEST_STRATEGY.md`** — required proof that behaviour remains correct.
6. **`DEPLOYMENT_GUIDE.md`** — build and hosting procedure.
7. **`DECISIONS.md`** — rationale for choices and conditions for revisiting them.

Implementation must not quietly weaken a safety rule to make a test pass. If a rule needs to change, update the relevant architecture document and tests in the same change.

## Documents

- [Project rules](PROJECT_RULES.md)
- [Verification ruleset](VERIFICATION_RULESET.md)
- [API contract](API_CONTRACT.md)
- [System architecture](SYSTEM_ARCHITECTURE.md)
- [Verification limitations and safety philosophy](VERIFICATION_LIMITATIONS.md)
- [Test strategy](TEST_STRATEGY.md)
- [Deployment guide](DEPLOYMENT_GUIDE.md)
- [Architecture decisions](DECISIONS.md)

## Rule maintenance

For every behavioural change:

1. Decide whether it changes a product, verification, API, privacy, or deployment rule.
2. Update this folder first or in the same pull request as the implementation.
3. Add or update a test that demonstrates the intended behaviour.
4. Run `npm run typecheck`, `npm run test`, and `npm run build` from the repository root.
5. Describe any known limitation in the relevant rule document and README.
