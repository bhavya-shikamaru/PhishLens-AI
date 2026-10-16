# Architecture

```text
Browser (React + Vite)
  ├─ URL/text input
  ├─ QR image -> canvas -> jsQR (local; image stays in browser)
  └─ POST /api/analyze { payload }
           |
           v
Express + TypeScript API
  ├─ Zod input validation / length limit
  ├─ deterministic URL structure observations
  └─ @google/genai -> Gemma 4 (server-side key only)
           |
           v
Structured assessment -> UI
```

## Boundaries
- No URL is fetched, opened, crawled, or checked for reputation.
- No persistence/database is configured.
- Uploaded QR images are decoded in the browser and are not sent to the server.
- The decoded payload is sent to the AI provider for analysis.
- AI output is untrusted and validated/normalized before returning to the browser.
