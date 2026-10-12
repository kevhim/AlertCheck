# AlertCheck Verification Ruleset

This document describes the intended and currently implemented deterministic checks. It is not a statement that arbitrary natural-language meaning can be completely verified.

## 1. Input model

A verification request contains a `MasterWarning`, a non-empty `candidateText`, and optional `format`, `language`, and `variantId` fields. The shared schema validates required fields and internal consistency before text-level checks run.

The structured master warning is the authoritative comparison source for the prototype. It includes hazard type, severity, affected areas, issue/validity times, an optional evacuation deadline, required actions, prohibited actions, source reference, and optional contact details.

## 2. Validation pipeline

The shared `verifyWarning` pipeline runs these stages:

1. **Request/schema validation** — checks required structure, allowed severity/format/language values, non-empty areas and required actions, valid timestamps, and basic time-window consistency.
2. **Channel-length check** — compares rendered/candidate length with the current format limit.
3. **Language review gate** — Hindi demonstration variants receive a human-review finding because the current rule system cannot certify arbitrary Hindi semantic equivalence.
4. **Location checks** — looks for required affected areas and flags omissions or unmatched location text where the rules can identify them.
5. **Deadline checks** — compares declared evacuation deadline/time information with the candidate text.
6. **Quantity/contact checks** — checks relevant numbers, telephone digits, and quantities.
7. **Required-action checks** — checks whether declared protective actions appear to be preserved and flags suspected omission/rephrasing.
8. **Prohibition checks** — checks known negative/prohibition patterns and attempts to identify stripped or reversed negation.
9. **Finding aggregation** — counts severities and derives the report status.

## 3. Format limits

The current configured limits are:

| Format | Limit | Behaviour |
|---|---:|---|
| `full` | 4,000 characters | Flag if exceeded |
| `short_sms` | 160 characters | Flag if exceeded; do not silently discard facts |
| `social_media` | 280 characters | Flag if exceeded; do not silently discard facts |

These limits are prototype configuration, not a promise about every downstream delivery provider. Update them only with a documented rationale and regression tests.

## 4. Severity and overall status

### `issues_found`

Used when the verifier identifies one or more critical discrepancies or mismatch findings. It indicates a potential issue requiring correction; it does not by itself identify the correct replacement text.

### `needs_review`

Used when findings include warnings, an unverified language variant, ambiguity, or another condition requiring a qualified human review.

### `no_mismatch_detected`

Means only that the implemented checks did not identify a mismatch. It does **not** mean the warning is safe, complete, legally valid, or semantically faithful.

Finding severity values currently include `critical`, `warning`, and `info`. Finding status values include `mismatch`, `missing`, `needs_human_review`, and `warning`.

## 5. Safety invariants

- Never certify arbitrary translations as correct.
- Never infer safety from a lack of findings.
- Never silently truncate critical information.
- Preserve evidence snippets for findings whenever possible.
- Use `needs_review` when rule coverage is insufficient or language semantics are ambiguous.
- A human reviewer remains responsible for publication approval.
- Every demonstration scenario must be explicitly marked fictional.

## 6. Required regression cases

At minimum, tests must cover:

- Missing or altered affected location.
- Missing or changed deadline.
- Changed phone number or quantity.
- Required action omitted or changed.
- Prohibition omitted or reversed.
- Message exceeding its target character limit.
- Invalid timestamps and inconsistent validity windows.
- Hindi demonstration review gate.
- Equivalent or rephrased wording that could otherwise cause a false positive.
- Invalid/malformed API requests.
- Matching core results when called from browser and Worker modes, apart from runtime metadata.

## 7. Limitations

The current checker uses a finite set of deterministic extractors and patterns. It can miss novel phrasings, idioms, grammatical changes, altered urgency, or subtle translation errors. It can also flag harmless wording differences. Treat findings as assistance for human review, not a formal safety certification.
