# PhishLens AI — Antigravity Prompt-by-Prompt Hack Day Runbook
**Hacktoberfest Hack Day · ITM University, Gwalior · Friday, 16 October 2026 · 9:00 AM–4:00 PM IST**

This is the **adapted execution version** of Claude’s plan. It assumes the existing PhishLens AI scaffold has already been generated. The goal is to use Antigravity one prompt at a time, inspect each result, and pause so you can consult ChatGPT/Kabir before moving on.

## North-star goal

By 4:00 PM, have a reliable, demoable PhishLens AI prototype for the **Gemma 4 prize challenge only**. A user should be able to submit suspicious text/a URL, get a cautious evidence-based assessment from Gemma 4, and (if time permits) decode a QR code locally and analyse a screenshot. The app should never open or fetch suspicious URLs.

## Important compatibility rules — read before starting

The scaffold we already generated is the source of truth. Do **not** let Antigravity rebuild it from scratch or silently replace its architecture with Claude’s assumed structure.

- Frontend folder: `client/` (React + Vite + TypeScript).
- Backend folder: `server/` (Node.js + Express + TypeScript).
- Existing primary endpoint: `POST /api/analyze`.
- Existing provider integration: `@google/genai`, model ID `gemma-4-26b-a4b-it`.
- Existing response shape: `risk: LOW | MEDIUM | HIGH | UNKNOWN`, `payloadType`, `evidence[]`, `uncertainty`, `recommendedAction[]`, `deterministicObservations[]`, `disclaimer`.
- QR decode is intended to happen **in the browser** using `jsQR`; decoded content is treated as inert text and analysed, never opened.
- The screenshot/image-analysis path is optional and must be added only after the core text/URL and QR paths are stable.
- Do **not** rename the endpoint to `/api/analyze/text` or `/api/analyze/image` just to match Claude’s original plan. If a separate image endpoint is genuinely needed, add it as an explicit, documented extension while preserving `/api/analyze` for the existing text flow.
- Do not introduce a new `web/` directory. Keep the current `client/` + `server/` layout.
- Do not replace the existing response contract with Claude’s alternative `assessment/summary/visibleUrls` contract. If the UI needs more detail, extend the existing contract compatibly and update the client, server, docs, and tests together.
- Avoid unnecessary rewrites, new dependencies, styling overhauls, authentication, databases, scan history, or deployment work unless all core requirements already pass.

## Secret and file safety — non-negotiable

The following local files are valuable and must be preserved:
- `.env`
- `test-gemma.mjs`
- `test-image.mjs`
- `test-qr.mjs`

They may live in the existing `Testing` folder at `C:\Users\Administrator\Desktop\Hack Day\Testing`, rather than in the scaffold root. Inspect locations; do not assume they are inside the repo.

**Never** print, paste into chat, screenshot, overwrite, rename, or commit API-key values. Do not put `GEMINI_API_KEY` in frontend code, `client/.env`, a `VITE_*` variable, browser bundles, README examples, logs, or Git history. Keep the real key in a backend-only `.env`. Keep `.env` out of Git and verify `.gitignore`. If a key is accidentally exposed, stop and rotate it.

## How to use this runbook

1. Open the **existing scaffold folder** in Antigravity. Make sure it is the actual project, not a newly created blank folder.
2. Copy **Prompt 0** into Antigravity.
3. Review Antigravity’s report. Run any commands it recommends yourself if they need a terminal, or let it run them if you trust the workspace actions.
4. After each prompt, inspect the changed-file list and test result. **Do not paste the next prompt until the current checkpoint passes or you have discussed the blocker with Kabir.**
5. When you consult Kabir, share the error output and changed-file list, but redact keys, tokens, personal paths if you prefer, and any secret values.
6. If behind schedule, skip optional screenshot analysis before compromising the working text/URL path, QR flow, security, or demo.

---

# Schedule at a glance

| Time (IST) | Goal | Exit condition |
|---|---|---|
| 9:00–9:20 | Open repo, protect files, inspect scaffold | Correct repo and file preservation confirmed |
| 9:20–10:00 | Install/check/build/run existing scaffold | Baseline failures documented; app starts or blocker isolated |
| 10:00–11:00 | Make text/URL analysis reliable | Valid result and graceful error/empty-output handling |
| 11:00–11:45 | Validate UI and core UX | Paste/analyse/result/loading/error states work |
| 11:45–12:00 | Short break + checkpoint | Decide whether QR/image phases fit |
| 12:00–12:40 | Verify local QR decode and safe handoff | QR decoded locally and treated as inert text |
| 12:40–1:10 | Lunch | No coding required |
| 1:10–2:00 | Optional screenshot/image analysis | Only continue if text + QR are already stable |
| 2:00–2:15 | Feature freeze and integration check | No new features after 2:15 PM |
| 2:15–2:50 | Validation, security, tests | High-risk regressions checked; secrets protected |
| 2:50–3:15 | README, license, repo hygiene | Fresh-clone instructions and honest limitations documented |
| 3:15–3:35 | Git status, commit, push, submission | Public repo URL verified; no secrets in tracked files |
| 3:35–4:00 | Demo rehearsal and buffer | 2-minute demo works; fallback ready |

This is a target schedule, not a reason to rush unsafe changes. If the scaffold needs more time to become runnable, defer screenshot analysis first.

---

# Prompt 0 — Inspect first; do not edit

**Paste into Antigravity:**

> We are continuing an existing PhishLens AI scaffold. Do not create a new project, rewrite the app, or edit files yet.
>
> First inspect the repository and report:
> 1. The actual folder tree (especially `client/`, `server/`, docs, tests, package manifests, and `.gitignore`).
> 2. The current frontend entry points and how the client calls the backend.
> 3. The current backend routes, request body, response type, and Gemma 4 integration.
> 4. The existing test scripts and build/typecheck scripts.
> 5. Whether `.env` is ignored by Git, without reading or printing its contents.
> 6. Any mismatch between the code and docs.
>
> Our compatibility constraints: preserve `client/` + `server/`; preserve `POST /api/analyze`; preserve the current response fields `risk: LOW|MEDIUM|HIGH|UNKNOWN`, `payloadType`, `evidence[]`, `uncertainty`, `recommendedAction[]`, `deterministicObservations[]`, and `disclaimer`; preserve the `@google/genai` integration with model `gemma-4-26b-a4b-it`. Do not introduce `web/` or replace the response contract.
>
> Also note that `.env`, `test-gemma.mjs`, `test-image.mjs`, and `test-qr.mjs` may exist in `C:\Users\Administrator\Desktop\Hack Day\Testing`, outside this repository. Do not open, modify, move, or print `.env`. Do not edit anything in this step. End with a concise report and wait for my approval.

**Checkpoint:** You know which folder Antigravity opened and what is already implemented. If it says it cannot find the scaffold, stop and open the correct folder.

---

# Prompt 1 — Protect the workspace and establish baseline

**Paste only after Prompt 0 is reviewed:**

> Based on your inspection, make a minimal safety/baseline pass only.
>
> - Verify `.env` is covered by `.gitignore` without reading its value. If it is not ignored, add the narrowest appropriate ignore rule.
> - Check whether any API key is hard-coded in tracked frontend or backend source. Search for likely secret variable names, but never print actual secret values. If you find a possible secret, report the file and line context with the value redacted; do not delete or rotate anything automatically.
> - Do not touch `C:\Users\Administrator\Desktop\Hack Day\Testing\.env`, `test-gemma.mjs`, `test-image.mjs`, or `test-qr.mjs`.
> - Inspect package scripts and install dependencies only if necessary, using the existing package manager and lockfiles. Do not replace lockfiles or upgrade all dependencies.
> - Run the existing typecheck, tests, and production build if available. Start the app if possible.
> - Do not add features yet. Report every command, pass/fail result, and exact actionable failure (with secrets redacted).
>
> Keep the current folder layout and API contract. Stop after reporting results.

**Checkpoint:** Baseline status is known. If dependency installation or the build fails, fix that before adding functionality.

---

# Prompt 2 — Fix only real baseline blockers

**Paste only if Prompt 1 found failures:**

> Fix only the concrete baseline failures you reported. Do not refactor unrelated files or add features.
>
> Preserve the current `client/` + `server/` layout, `POST /api/analyze`, the existing response contract, and the Gemma 4 model configuration. Do not modify the separate Testing folder or any protected test scripts.
>
> After each fix, rerun the failing command and then rerun the relevant typecheck/build/tests. Summarize changed files, the root cause, and the verification result. If a failure depends on a missing secret or external service, do not reveal the secret; explain how I can test it locally. Stop when the baseline is clean or the remaining blocker is clearly documented.

**Checkpoint:** Do not proceed until the app starts or any remaining blocker is understood. If Prompt 1 passed, skip this prompt.

---

# Prompt 3 — Make text/URL analysis robust

**Target time: 10:00–11:00**

> Review the existing backend handler for `POST /api/analyze` and the existing Gemma 4 integration. Improve reliability with minimal changes, keeping the existing request and response contracts compatible.
>
> Requirements:
> - Validate the request body and reject missing, non-string, empty, or excessively long input with a clear 4xx response.
> - Treat submitted URLs and text as untrusted data. Never fetch, browse to, resolve, preview, or automatically open a submitted URL. Do not execute submitted content.
> - Keep the API key server-side only. Never log request secrets or environment values.
> - Handle provider errors, timeouts, rate limits, blocked responses, malformed responses, and empty model output. An empty output must never appear to the user as a successful clean bill of health. Use the existing `UNKNOWN` risk value when the app cannot reach a justified assessment, and provide a clear uncertainty/error explanation.
> - Validate or normalize model output before returning it. Do not trust model-generated JSON or enum values without checking them.
> - Keep deterministic URL/text observations separate from model interpretation in `deterministicObservations[]` and `evidence[]`.
> - Keep the existing response fields: `risk`, `payloadType`, `evidence`, `uncertainty`, `recommendedAction`, `deterministicObservations`, and `disclaimer`. Do not switch to Claude’s alternate response shape.
> - Do not claim that the tool proves a message or URL is safe. The UI should communicate uncertainty and encourage users to verify through an official channel.
> - Add or update focused tests using the project’s existing test setup. If no test setup exists, recommend the smallest practical option instead of introducing a large test stack.
>
> First explain the files you intend to change in 3–6 bullets. Then implement, run tests/typecheck/build, and report results. Do not add screenshot analysis or redesign the UI in this step. Stop for review.

**Checkpoint:** Empty provider output, provider errors, invalid input, and valid input all produce safe and understandable outcomes.

---

# Prompt 4 — Verify the main user flow and UI states

**Target time: 11:00–11:45**

> Inspect the existing React UI and connect/fix the main text-analysis flow without replacing the current design or changing the API contract.
>
> The user should be able to paste suspicious text or a URL, submit it, see a loading state, and receive a clearly structured result:
> - risk label (`LOW`, `MEDIUM`, `HIGH`, or `UNKNOWN`);
> - evidence and the difference between observed facts and model interpretation;
> - uncertainty/limitations;
> - safe next actions;
> - a visible disclaimer that this is an assistive assessment, not a guarantee.
>
> Also handle blank input, slow responses, network errors, server errors, malformed responses, and retrying. Disable duplicate submissions while one is in progress. Keep the API key completely out of the client. Do not auto-link or auto-open suspicious URLs; if a URL is displayed, render it as inert text or a safely handled non-clickable string.
>
> Keep `client/`, `server/`, `POST /api/analyze`, and the existing response fields. Make the smallest changes necessary. Add/adjust tests where practical, run typecheck/build, and give me a short manual test checklist. Stop for review.

**Manual checks:** ordinary text, a suspicious-looking URL, blank input, long input, provider unavailable, and empty model output.

---

# Prompt 5 — QR flow: local decode only

**Target time: 12:00–12:40**

> Inspect the current QR implementation and the existing `test-qr.mjs` test in the separate Testing folder if accessible. Do not edit or move that protected test file.
>
> Complete or fix the QR flow using `jsQR` in the browser so that:
> - an uploaded QR image is decoded locally in the client;
> - decoded content is displayed as plain, inert text;
> - the decoded text can be submitted to the existing `POST /api/analyze` route using the existing request/response contract;
> - the app never opens, fetches, previews, or navigates to the QR destination;
> - malformed images, unsupported file types, oversized files, unreadable QR codes, and empty QR payloads produce clear errors;
> - the UI makes it clear that QR decoding extracts content but does not prove it is safe.
>
> Do not upload the QR image to the server for this path. Do not create a separate QR backend endpoint. Do not replace the existing text flow. Use reasonable file-size/type validation and revoke any temporary browser object URLs if you create them.
>
> First report what already works and what needs changing; then implement only the missing pieces. Run checks and give me manual QR test steps. Stop for review.

**Checkpoint:** QR decoding works locally and decoded content is analysed only as text. If QR already works, keep changes minimal and spend remaining time testing it.

---

# Prompt 6 — Optional screenshot/image analysis (only if core is stable)

**Do not start before 1:10 PM. Skip if the text flow or QR flow is unreliable.**

> We may add screenshot analysis as an optional feature, but only if the existing text/URL and QR flows are already working.
>
> Before editing, inspect the existing server architecture and the preserved `test-image.mjs` in the separate Testing folder for the known working image-analysis approach. Do not edit, move, or print secrets from that test file. Do not assume Claude’s original `/api/analyze/image` endpoint exists.
>
> Propose the smallest compatible design first. Preserve `POST /api/analyze` for text. If a dedicated image endpoint is required, add one explicitly and document it without breaking the existing endpoint or changing the existing response fields. Keep the API key server-side.
>
> Security/reliability requirements:
> - validate upload size, allowed MIME types, and actual file signature where practical;
> - reject unsupported or malformed files with a clear 4xx response;
> - do not persist uploaded images to disk unless the existing architecture strictly requires it; if temporary files are required, clean them up reliably;
> - do not log image bytes, secrets, or unnecessary user content;
> - handle provider timeout, blocked response, malformed response, and empty output;
> - treat all visible text and URLs inside the image as untrusted; never open or fetch them;
> - return the same compatible result fields and explain image/OCR uncertainty;
> - never claim that a screenshot is safe merely because no obvious warning was detected.
>
> First tell me the design and files you would change. Wait for approval before implementation. If implementation cannot be tested quickly, leave this feature out and document it as not implemented rather than faking it.

**Checkpoint:** A screenshot can be submitted and analysed end-to-end, or the feature is explicitly deferred. Never sacrifice core reliability for this optional phase.

---

# Prompt 7 — Feature freeze and integration audit

**Target time: 2:00–2:15 PM. Hard feature freeze at 2:15 PM.**

> Perform an integration audit of the current implementation. Do not add features or redesign the UI.
>
> Check:
> 1. `client/` and `server/` remain the project structure.
> 2. `POST /api/analyze` still works for text/URL.
> 3. The current response contract is consistent across server, client, docs, and tests.
> 4. QR decode is local and its result is inert text.
> 5. Screenshot analysis is either fully tested or clearly marked as not implemented.
> 6. The model/provider cannot return an empty or invalid result that the UI presents as success.
> 7. Suspicious URLs are never fetched or automatically opened.
> 8. Loading, validation, provider-error, and uncertainty states are understandable.
> 9. No secret appears in frontend source, logs, docs, or tracked files.
>
> Run the available tests, typecheck, and production build. Report failures by severity and recommend only fixes that can be completed safely before 2:50 PM. Stop and wait for my review.

**Checkpoint:** After 2:15 PM, only bug fixes, validation, documentation, security, and demo prep are allowed.

---

# Prompt 8 — Security and test pass

**Target time: 2:15–2:50 PM**

> Make a focused security and testing pass. Do not add features.
>
> Inspect input validation, file upload handling if present, error handling, logging, CORS configuration, and rate limiting. Add a modest rate limit if the app is exposed beyond localhost and it can be added safely with the existing setup. Do not overbuild authentication or infrastructure for a one-day prototype.
>
> Verify:
> - `.env` is ignored by Git;
> - the API key is referenced only by the server;
> - no secrets are present in tracked files or recent staged changes;
> - invalid/empty/oversized inputs are rejected;
> - empty provider output and provider failure yield `UNKNOWN`/an explicit error, never a false “safe” result;
> - decoded QR payloads and screenshot-visible URLs are never fetched or auto-opened;
> - user-visible claims remain cautious and the disclaimer is present.
>
> Run tests, typecheck, and production build. Do not print secret values during searches or reports. Do not delete protected files. Summarize changed files, tests, remaining risks, and any manual checks I need to perform. Stop for review.

**Checkpoint:** If security checks fail, fix those before spending time on polish.

---

# Prompt 9 — README, license, and honest project documentation

**Target time: 2:50–3:15 PM**

> Prepare the repository for a judge or reviewer without overstating capabilities.
>
> Update the existing README and relevant docs to match the actual implementation. Keep the current structure and route contract. Include:
> - what PhishLens AI does and the problem it addresses;
> - that the project uses Gemma 4 via the Gemini API and the actual model ID `gemma-4-26b-a4b-it`;
> - architecture (`client/`, `server/`), actual endpoint(s), and actual response fields;
> - prerequisites and Windows-friendly setup/run commands;
> - how to configure `GEMINI_API_KEY` in the server-side `.env`, using a placeholder only;
> - how to run tests/build;
> - supported inputs and known limitations;
> - a clear statement that assessments can be wrong and are not a guarantee of safety;
> - that submitted URLs are not fetched or opened;
> - that QR decode is local, if confirmed by the code;
> - screenshot analysis only if it is genuinely implemented and tested.
>
> Inspect the repository for an existing license before adding one. Do not invent a license or overwrite an existing license. If no license exists, tell me to choose one or recommend a suitable open-source option for my approval rather than silently deciding.
>
> Do not claim unsupported features, benchmark results, perfect detection, or production readiness. Do not include the real API key, private paths, or local-only artifacts. Run the build and tests after documentation edits. Stop for review.

**Checkpoint:** README setup instructions should work from a clean clone, using placeholders rather than real credentials.

---

# Prompt 10 — Final Git and submission hygiene

**Target time: 3:15–3:35 PM**

> Prepare the current repo for a public submission, but do not push or publish without showing me the proposed actions first.
>
> Run and report:
> - `git status --short`;
> - the staged-file list (if anything is staged);
> - a safe secret scan of tracked/staged files that redacts any possible secret values;
> - confirmation that `.env`, local test scripts, build outputs, dependencies, and private test assets are not accidentally tracked;
> - final tests/typecheck/build results;
> - whether a license is present and what it is;
> - the README setup/run instructions.
>
> Never print `.env` contents. Do not add the separate `Testing` folder to the repository. Do not include `.env`, `test-gemma.mjs`, `test-image.mjs`, or `test-qr.mjs` unless I explicitly review and approve a safe, sanitized test fixture; the real files and credentials stay local.
>
> Show me the exact proposed commit summary and whether a push is possible. Wait for my explicit approval before committing, pushing, or making the repo public.

**Checkpoint:** You personally review the diff and staged files before any public push.

---

# Prompt 11 — Demo rehearsal and final report

**Target time: 3:35–4:00 PM**

> Help me rehearse a truthful 2-minute demo using only features that currently work.
>
> Produce:
> 1. a short opening explaining the phishing/QR threat and the intended value;
> 2. a live-demo sequence with a safe sample text/URL, showing the evidence, uncertainty, and next steps;
> 3. a QR demo only if local decoding and analysis have passed;
> 4. a screenshot demo only if that path has passed end-to-end tests;
> 5. a brief architecture explanation showing where Gemma 4 is used;
> 6. honest limitations and what I would improve next;
> 7. a fallback if the network or Gemini API fails during the demo.
>
> Do not use a real victim’s message, personal data, real credentials, or a live malicious URL. Do not claim that the model catches every phishing attempt or proves a link safe. Do not modify working code unless a critical demo blocker is found; if a blocker is found, propose the smallest fix and wait for approval.
>
> Finish with a final status report: working features, deferred features, tests/build status, known limitations, repo URL if I provide one, and any submission step I still need to complete.

**Checkpoint:** Keep the demo short, reliable, and honest. If the network fails, explain the architecture and show a previously captured, sanitized result only if the event rules allow it.

---

# Manual test matrix

Use this after the relevant prompts. Do not use real personal data or click suspicious links.

| Test | Expected outcome |
|---|---|
| Ordinary harmless sample text | A cautious assessment with evidence/limitations; never a guarantee |
| Suspicious-looking sample URL | Text/URL analysis only; app does not request the URL |
| Blank or whitespace input | Clear validation message; no model call |
| Extremely long input | Rejected or safely bounded with a clear message |
| Provider unavailable / invalid key | Clear failure or `UNKNOWN`; no crash and no secret leak |
| Empty model response | Never treated as a clean result; explicit uncertainty/error |
| Malformed provider response | Safe fallback; no unchecked enum/JSON |
| QR image with a URL | Decoded locally; URL remains inert; analysis does not navigate/fetch |
| Unreadable QR / invalid image | Helpful validation error |
| Unsupported/oversized screenshot | Rejected clearly if image upload is implemented |
| Slow API response | Loading state; no duplicate submission; eventual result/error |
| Fresh clone setup | README instructions work with a user-supplied server-side key |

# Final decision rules

- **Protect the core first:** text/URL flow → QR flow → security/reliability → documentation/demo → optional screenshot analysis.
- **At 2:15 PM, freeze features.**
- If the model returns nothing, the app must not imply “safe.”
- If a feature is incomplete, label it honestly as deferred.
- Never browse to, fetch, or auto-open a suspicious URL.
- Never commit credentials.
- Ask Kabir to help interpret failures between prompts. Paste redacted errors, the prompt you ran, Antigravity’s summary, and the changed-file list—not secrets.
