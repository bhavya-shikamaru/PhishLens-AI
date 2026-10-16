# Security notes

- Keep `GEMINI_API_KEY` in `server/.env`; never expose it in client code or commit `.env`.
- Never automatically open or fetch a submitted URL.
- QR images are decoded in-browser. Enforce image MIME and size limits and a pixel-count limit.
- Treat QR payloads and model output as untrusted input.
- Do not render model output as HTML; React text rendering is used.
- Do not store scan results by default.
- Avoid claiming domain reputation, ownership, page behavior, or maliciousness without independent evidence.
- A LOW rating is not a safety guarantee. Provide uncertainty and safe next steps.
- Before public deployment, add rate limiting, request timeouts, hardened production CORS, logging hygiene, and a deployment-specific secrets manager.
