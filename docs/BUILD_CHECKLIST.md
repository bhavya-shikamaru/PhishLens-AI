# Build checklist

## Scaffold / first run
- [ ] Copy `server/.env.example` to `server/.env` and add the API key.
- [ ] Run `npm install`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run dev` and verify the UI and `/api/health`.

## MVP acceptance
- [ ] Paste `https://example.com`; verify response renders.
- [ ] Upload a QR image containing a known URL; verify local decode matches exactly.
- [ ] Test a non-URL QR payload.
- [ ] Test invalid image, unsupported MIME type, and image over 5 MB.
- [ ] Test empty and overlong payloads.
- [ ] Confirm no URL is opened or fetched by the app.
- [ ] Confirm `.env` is ignored by Git and key is absent from browser bundles.
- [ ] Confirm no scan history is persisted.
- [ ] Capture a clean demo and prepare a 60–90 second explanation.
