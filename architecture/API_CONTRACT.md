# AlertCheck API Contract

The API provides a thin HTTP interface over the shared deterministic verification engine. The browser can invoke that same engine locally if the Worker is unavailable.

## Base paths

- `GET /api/health`
- `POST /api/verify`

The Worker also supports legacy aliases `/health`, `/`, and `/verify` as implemented in `backend/src/index.ts`; new clients should use `/api/...` paths.

## `GET /api/health`

Returns a JSON health response. It must not reveal secrets, internal environment variables, or stack traces.

Example shape:

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

The deployed response should be verified against the current handler before this example is treated as exact.

## `POST /api/verify`

Request content type: `application/json`.

The backend currently enforces a maximum request body of 64 KiB and returns structured client errors for invalid content type, oversized bodies, empty bodies, or malformed JSON.

### Request shape

```json
{
  "masterWarning": {
    "warningId": "demo-flood-001",
    "hazardType": "Flash Flood",
    "severity": "emergency",
    "affectedAreas": ["River District", "Sector 4"],
    "issuedAt": "2026-10-12T12:00:00Z",
    "validUntil": "2026-10-12T22:00:00Z",
    "evacuationDeadline": "18:00",
    "requiredActions": ["Evacuate to designated shelter"],
    "prohibitedActions": ["Do not drive through floodwater"],
    "safetyContact": "1800-555-0199",
    "sourceReference": "Fictional Civil Defense Bureau",
    "sourceVersion": 1
  },
  "candidateText": "Emergency warning for River District and Sector 4. Evacuate by 18:00. Do not drive through floodwater. Call 1800-555-0199.",
  "format": "full",
  "language": "en",
  "variantId": "demo-variant-001"
}
```

Allowed `severity` values: `advisory`, `watch`, `warning`, `emergency`.  
Allowed `format` values: `full`, `short_sms`, `social_media`.  
Allowed `language` values: `en`, `hi`.

`format`, `language`, and `variantId` are optional according to the current domain type. The master warning and candidate text are required.

### Response shape

Successful verification returns a `VerificationReport` containing:

- `reportId`, `warningId`, optional `variantId`, and `verifiedAt`.
- `status`: `issues_found`, `needs_review`, or `no_mismatch_detected`.
- `engineMode`: `cloudflare_worker` or `browser_local`.
- `summary` counts for findings and review flags.
- `findings`: category, severity, explanation, evidence, status, and human-review requirement.
- `disclaimer` and non-sensitive comparison metadata.

### Error handling

The implementation currently uses HTTP error responses for invalid request parsing and unexpected failures. Keep the error JSON structure consistent with `backend/src/lib/response.ts`; update this document if that shape changes.

## CORS

The Worker has configurable `ALLOWED_ORIGIN`. Production deployment must configure it to the exact frontend origin. Do not use a wildcard origin for a credentialed API. The current application should not require cross-origin credentials.

## Privacy

The backend must not persist request bodies. Do not introduce payload logging, analytics, or external AI forwarding without revisiting the project rules and documenting the change.
