# PhishLens AI — Hack Day MVP scaffold

PhishLens AI inspects a URL or text decoded from a QR code and provides a cautious, explainable preliminary risk assessment using Gemma 4.

## Design principles
- QR decoding happens locally in the browser with `jsQR`; the QR image is not uploaded to the backend.
- The backend sends decoded text to Gemma 4. The Gemini API key never goes to the browser.
- URLs are parsed locally for deterministic observations; the app does **not** visit submitted URLs or check live reputation.
- Results distinguish observed indicators from uncertainty. A model-generated risk label is not proof that a site is safe or malicious.
- No scan history is persisted by default.

## Requirements
- Node.js 20+ recommended
- A Google AI Studio API key with access to the configured Gemma model

## Setup
1. Copy `server/.env.example` to `server/.env`.
2. Put your key in `server/.env` as `GEMINI_API_KEY=...`. Never put it in `client/.env`.
3. From this folder run:

```bash
npm install
npm run dev
```

Vite runs at `http://localhost:5173`; the Express API runs at `http://localhost:3001`.

## Production build / type checks
```bash
npm run typecheck
npm run build
```

## Test
```bash
npm test
```

## API
`POST /api/analyze`
```json
{ "payload": "https://example.com" }
```
Returns a structured assessment with `risk`, `payloadType`, `evidence`, `uncertainty`, and `recommendedAction`.

## Current limitations
- No live domain reputation, DNS, certificate, or redirect checks.
- The AI assessment is heuristic and can be wrong.
- URL parsing and indicators are evidence, not a verdict.
- Do not enter credentials into a site merely because this app labels it LOW risk.
