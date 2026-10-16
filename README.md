# PhishLens AI

A browser-based tool that helps users examine suspicious URLs, text, QR codes, and screenshots for visible phishing or social-engineering indicators — powered by [Gemma 4](https://ai.google.dev/) via the Gemini API.

> **Important:** PhishLens AI is an assistive tool built in a single day. Assessments can be wrong. A LOW risk rating does not confirm a destination is safe. Always verify through an official channel before acting.

---

## What it does

| Input mode | How it works |
|---|---|
| **URL / Text** | Paste any suspicious URL or text. The server runs deterministic structural checks then asks Gemma 4 for a cautious risk assessment. |
| **QR Image** | Upload a PNG/JPEG/WebP containing a QR code. The QR is decoded **entirely in the browser** using `jsQR` — the image is never sent to the server. The decoded text is then submitted for analysis. |
| **Screenshot** | Upload a screenshot of a suspicious message or web page. The image is sent to the server (not stored) and Gemma 4 reads visible text to identify indicators. |

**What it never does:**
- visits, fetches, or previews submitted URLs;
- auto-opens or auto-links any decoded QR content;
- stores scan history or uploaded images to disk;
- claim a result is a guarantee of safety or malice.

---

## Architecture

```
Browser  (React + Vite, port 5173)
  ├─ URL/text input  ──────────────────────────────┐
  ├─ QR decode: canvas → jsQR (local, no upload)   │ POST /api/analyze
  └─ Screenshot picker ────────────────────────────┼─POST /api/analyze/image
                                                   │
Express + TypeScript API  (port 3001)              │
  ├─ Zod validation + length limits                │
  ├─ Deterministic URL structural observations     │
  ├─ multer memoryStorage (image routes only)      │
  └─ @google/genai → gemma-4-26b-a4b-it           │
                ↓                                  │
  Structured JSON assessment ─────────────────────→ UI
```

- `client/` — Vite + React frontend (TypeScript)
- `server/` — Express backend (TypeScript, ESM)
- `docs/` — API contract, architecture, security notes, build checklist

---

## Prerequisites

- **Node.js 20+** (check: `node --version`)
- A **Google AI Studio** API key with access to `gemma-4-26b-a4b-it`
  - Get one at <https://aistudio.google.com/apikey>

---

## Setup (Windows)

```powershell
# 1. Clone / open the project folder, then install dependencies
npm install

# 2. Create the server environment file
copy server\.env.example server\.env
```

Open `server\.env` in any text editor and set:

```
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
PORT=3001
```

> **Never** put the key in `client/.env`, a `VITE_*` variable, or anywhere tracked by Git.  
> `server/.env` is already covered by `.gitignore`.

---

## Running locally

```powershell
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:3001>
- Health check: <http://localhost:3001/api/health>

---

## Tests, typecheck, and build

```powershell
# Run the unit test suite (server-side helpers)
npm test

# Typecheck both workspaces
npm run typecheck

# Production build (server tsc + client vite)
npm run build
```

---

## API endpoints

### `POST /api/analyze` — text / URL / decoded QR content

**Request**
```json
{ "payload": "https://example.com/suspicious?q=login" }
```
- `payload`: string, 1–4096 characters (trimmed).
- Returns `400` for missing/empty/oversized input.

**Response** (all fields always present)
```json
{
  "risk": "MEDIUM",
  "payloadType": "HTTPS URL with login-related path",
  "evidence": ["Login path detected in URL", "Unknown domain"],
  "uncertainty": "No live reputation or redirect check was performed.",
  "recommendedAction": ["Verify the sender through an official channel before clicking."],
  "deterministicObservations": ["HTTPS scheme", "Single subdomain"],
  "disclaimer": "Preliminary text-based assessment only. No website was visited or live reputation checked. A LOW rating does not confirm the destination — always verify through an official channel."
}
```

`risk` is one of: `LOW` | `MEDIUM` | `HIGH` | `UNKNOWN`

### `POST /api/analyze/image` — screenshot analysis

**Request:** `multipart/form-data`, field name `image`.

- Accepted: `image/png`, `image/jpeg`, `image/webp`
- Max size: **2 MB**; file signature is verified server-side.
- Image is held in RAM only — never written to disk, never logged.

**Response:** identical 7-field shape as above.

### `GET /api/health`

```json
{ "ok": true, "service": "phishlens-api" }
```

---

## Supported inputs

| Input | Accepted? | Notes |
|---|---|---|
| HTTPS URL | ✅ | Structural analysis only, not fetched |
| HTTP URL | ✅ | HTTP flagged as an observation |
| Plain text (non-URL) | ✅ | Analysed as free text |
| QR image (PNG/JPEG/WebP) | ✅ | Decoded locally; QR image not uploaded |
| Screenshot (PNG/JPEG/WebP, ≤ 2 MB) | ✅ | Uploaded to server, not stored |
| PDF / GIF / other | ❌ | Rejected with a clear error |
| Empty or whitespace-only input | ❌ | Rejected with `400` |
| Input > 4096 characters | ❌ | Rejected with `400` |

---

## Known limitations

- **No live checks.** DNS, WHOIS, TLS certificates, redirect chains, and live page content are never inspected. The app cannot detect cloaking, dynamic redirects, or time-limited phishing pages.
- **AI can be wrong.** Gemma 4 may miss indicators, over-flag benign content, or return uncertain output. `UNKNOWN` is returned when the model cannot reach a justified assessment.
- **QR decoding is best-effort.** Low-resolution, damaged, or rotated QR codes may not be readable by `jsQR`.
- **Screenshot text is visually extracted.** Blurry, small, or cut-off text may not be read correctly. The model is told to say so when text is unreadable.
- **No authentication or rate limiting** is configured in the current prototype. Do not expose this server publicly without adding both.
- **No scan history** is stored by default.

---

## License

No license file is currently present in this repository. See the [**License note**](#license-note) section below before sharing or publishing.

### License note

This project does not yet have an explicit open-source license. Without one, default copyright law applies — others cannot reproduce, distribute, or modify the code.

**Recommended options for a Hack Day project:**

| License | Best for |
|---|---|
| [MIT](https://choosealicense.com/licenses/mit/) | Maximum permissiveness; most common for hackathon projects |
| [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/) | MIT-equivalent + explicit patent grant |
| [GNU GPL v3](https://choosealicense.com/licenses/gpl-3.0/) | Requires derivative works to remain open source |

Add a `LICENSE` file to the repo root with your chosen text. You can generate the correct text at <https://choosealicense.com>.
