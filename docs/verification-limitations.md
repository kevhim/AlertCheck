# AlertCheck Verification Limitations & Safety Philosophy

## 1. The Core Limitation of Deterministic Natural Language Verification

AlertCheck uses deterministic, rule-based verification to cross-check structured factual claims against candidate message texts. While rule-based systems provide predictability, zero latency, and independence from paid cloud APIs, they have inherent linguistic boundaries:

> **Fundamental Principle:**
> No deterministic string-matching engine can certify that an arbitrary natural language translation is semantically identical, culturally appropriate, or free of misleading connotations.

When an emergency message is translated into other languages (such as Hindi), grammar structures, honorifics, sentence orders, and idioms diverge significantly from the English source text:
- In English, a negative imperative typically appears before the verb (`"Do not enter"`).
- In Hindi, negation may precede or follow the verb (`"प्रवेश न करें"` or `"अंदर मत जाएं"`).
- Synonyms can have drastically different urgency levels (e.g., "निकासी" vs "भागना").

Because automated engines cannot parse every nuanced human dialect without probabilistic ambiguity, **AlertCheck flags all non-English demonstration variants as requiring mandatory human review (`needs_review`)**.

---

## 2. Why AlertCheck Rejects Unconstrained Commercial AI

Commercial Large Language Models (LLMs) are popular for text summarization, but introducing them into critical emergency integrity verification presents severe operational risks:

1. **Non-Determinism**: An LLM given identical input can produce different classifications on different runs.
2. **Hallucinations & Confabulation**: Generative models may invent supporting evidence or falsely assert that an omitted fact is present.
3. **Availability Failure**: Disasters frequently cause internet and submarine cable disruptions. Systems requiring OpenAI, Anthropic, or cloud API keys fail when communication backhauls are severed.
4. **Data Privacy**: Sending unreleased emergency alert drafts to third-party model providers risks premature public leaks.

AlertCheck chose deterministic, unit-tested code that executes locally in milliseconds even inside a browser on an offline laptop.

---

## 3. The Status Taxonomy & Safety Rule

AlertCheck reports three distinct verification outcomes:

| Status Code | Meaning | Dissemination Rule |
| :--- | :--- | :--- |
| `issues_found` | One or more critical factual mismatches, reversed prohibitions, missing locations, or altered deadlines were confirmed. | **BLOCK PUBLICATION.** Must be corrected. |
| `needs_review` | Potential discrepancies, character limit violations, ambiguous rephrasings, or unverified translations were flagged. | **HOLD FOR REVIEW.** Qualified human communicator must review before release. |
| `no_mismatch_detected` | All structured facts from the master warning were identified in candidate text using deterministic rules. | **PROCEED TO STANDARD SIGN-OFF.** Human verification is still required. |

### The Critical Safety Invariant
> **AlertCheck NEVER describes a warning as "guaranteed safe", "correct", or "certified" merely because `no_mismatch_detected` was returned.**
> The absence of an identifiable factual conflict does not prove that a message is free of ambiguity, typography errors, or omissions not captured in the master data.

---

## 4. Policy on Channel Limits & Silent Truncation

A dangerous practice during emergency communications is "silent fact truncation": shortening a message to fit an SMS gateway's 160-character budget by removing an affected neighborhood, dropping a helpline, or omitting an evacuation route.

AlertCheck enforces a strict invariant:
- The template renderer **never silently deletes facts** to meet length limits.
- If rendered content exceeds the target budget, the system renders the full factual content and raises an explicit `message_length` warning (`status: 'needs_review'`).
- The human operator is then prompted to use approved abbreviations or split the message into multi-part broadcasts rather than omitting life-safety data.

---

## 5. Non-Authority Legal Disclaimer

AlertCheck is an experimental verification aid developed for hackathon demonstration. It is:
- **NOT** an official emergency-warning authority (such as FEMA, CAP-CP, or NDMA).
- **NOT** an automated dispatch system.
- **NOT** a replacement for qualified emergency managers and bilingual communications officers.

All real-world emergency warnings must be reviewed and authorized by designated human authorities in accordance with jurisdictional protocols.
