# API contract

## `GET /api/health`
Returns `{ "ok": true, "service": "phishlens-api" }`.

## `POST /api/analyze`
Request JSON:
```json
{ "payload": "https://example.com" }
```
- `payload`: required string, trimmed, 1–4096 characters.
- Returns `400` for invalid input, `503` if the server API key is missing, `502` if AI analysis fails.

Success response fields:
- `risk`: `LOW`, `MEDIUM`, `HIGH`, or `UNKNOWN`
- `payloadType`: string
- `evidence`: string array
- `uncertainty`: string
- `recommendedAction`: string array
- `deterministicObservations`: string array
- `disclaimer`: string
