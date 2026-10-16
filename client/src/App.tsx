import { useRef, useState } from "react";
import jsQR from "jsqr";
import { ShieldCheck, ScanLine, Link2, Upload, ArrowRight, AlertTriangle, CheckCircle2, LoaderCircle, LockKeyhole, RotateCcw } from "lucide-react";
import type { Assessment } from "./types";

type Mode = "url" | "qr";

export default function App() {
  const [mode, setMode] = useState<Mode>("url");
  const [payload, setPayload] = useState("");
  const [fileName, setFileName] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function decodeFile(file?: File) {
    setError("");
    setAssessment(null);
    setPayload("");
    setFileName("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 16_000_000) {
        bitmap.close();
        setError("Image dimensions are too large to process safely.");
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Could not initialize local image decoding.");
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(imageData.data, imageData.width, imageData.height);
      if (!decoded?.data) {
        setError("No QR code found. Try a clearer image with the whole code visible.");
        return;
      }
      setPayload(decoded.data);
      setFileName(file.name);
    } catch {
      setError("The image could not be decoded. Try a valid, non-corrupt image.");
    }
  }

  async function analyze() {
    setError("");
    setAssessment(null);
    const value = payload.trim();
    if (!value) {
      setError("Enter a URL/text payload or upload a QR image first.");
      return;
    }
    if (value.length > 4096) {
      setError("Payload is too long (maximum 4,096 characters).");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: value }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "error" in body
          ? String(body.error) : "Analysis failed. Please try again.";
        throw new Error(message);
      }
      setAssessment(body as Assessment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to the analysis server.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPayload(""); setFileName(""); setAssessment(null); setError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  const riskClass = assessment?.risk.toLowerCase() ?? "";

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => e.preventDefault()} aria-label="PhishLens AI home">
          <span className="brand-mark"><ShieldCheck size={23} /></span>
          <span>PhishLens<span className="brand-ai"> AI</span></span>
        </a>
        <span className="privacy-pill"><LockKeyhole size={13} /> Private by default</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> QR & URL SECURITY ANALYSIS</div>
        <h1>Look closer.<br /><span>Click safer.</span></h1>
        <p className="hero-copy">Inspect suspicious links before you trust them. Decode QR images locally, then ask AI to explain the warning signs.</p>
      </section>

      <section className="workspace">
        <div className="panel input-panel">
          <div className="panel-heading">
            <div><span className="step">01</span><h2>Inspect a payload</h2></div>
            <span className="tiny-label">NO LINK VISITS</span>
          </div>
          <div className="tabs" role="tablist" aria-label="Input type">
            <button className={mode === "url" ? "tab active" : "tab"} onClick={() => { setMode("url"); setError(""); }} role="tab" aria-selected={mode === "url"}><Link2 size={16} /> URL / Text</button>
            <button className={mode === "qr" ? "tab active" : "tab"} onClick={() => { setMode("qr"); setError(""); }} role="tab" aria-selected={mode === "qr"}><ScanLine size={16} /> QR Image</button>
          </div>

          {mode === "url" ? (
            <label className="field-label">URL or decoded text
              <textarea value={payload} onChange={(e) => { setPayload(e.target.value); setAssessment(null); }} placeholder="Paste a suspicious URL or text payload…" rows={5} maxLength={4096} />
            </label>
          ) : (
            <div className="upload-zone">
              <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => void decodeFile(e.target.files?.[0])} />
              <div className="upload-icon"><Upload size={22} /></div>
              <strong>{fileName || "Choose a QR-code image"}</strong>
              <span>PNG, JPEG or WebP · Up to 5 MB</span>
              <button className="secondary-button" onClick={() => fileInput.current?.click()}><Upload size={15} /> Select image</button>
              <p className="local-note"><LockKeyhole size={13} /> Image is decoded in your browser and is not uploaded.</p>
            </div>
          )}

          {mode === "qr" && payload && (
            <div className="decoded-box"><div className="decoded-title"><CheckCircle2 size={15} /> Decoded locally</div><code>{payload}</code><button className="text-button" onClick={() => setMode("url")}>Edit payload</button></div>
          )}
          <div className="input-meta"><span>{payload.length}/4096 characters</span><button className="text-button" onClick={reset}><RotateCcw size={13} /> Reset</button></div>
          {error && <div className="error-message" role="alert"><AlertTriangle size={16} /> {error}</div>}
          <button className="primary-button" onClick={() => void analyze()} disabled={busy || !payload.trim()}>
            {busy ? <><LoaderCircle className="spin" size={17} /> Analyzing…</> : <>Analyze payload <ArrowRight size={17} /></>}
          </button>
          <p className="microcopy">Your payload is sent to the configured AI API for analysis. No scan history is saved by this app.</p>
        </div>

        <div className="panel results-panel">
          <div className="panel-heading">
            <div><span className="step">02</span><h2>Risk assessment</h2></div>
            <span className="tiny-label">GEMMA 4</span>
          </div>
          {!assessment && !busy && (
            <div className="empty-state">
              <div className="empty-art"><ShieldCheck size={42} strokeWidth={1.3} /></div>
              <h3>Your results will appear here</h3>
              <p>Submit a URL or decode a QR image to get a cautious risk assessment, evidence, and safer next steps.</p>
              <div className="empty-features"><span><CheckCircle2 size={14} /> Evidence-led</span><span><LockKeyhole size={14} /> No auto-opening</span></div>
            </div>
          )}
          {busy && <div className="loading-state"><LoaderCircle className="spin" size={30} /><strong>Reviewing visible indicators</strong><span>Never visiting the submitted URL</span></div>}
          {assessment && (
            <div className="result-content">
              <div className={`risk-banner ${riskClass}`}>
                <div className="risk-icon"><ShieldCheck size={24} /></div>
                <div><span className="result-label">PRELIMINARY RISK</span><strong>{assessment.risk}</strong></div>
                <span className="ai-badge">AI-assisted</span>
              </div>
              <div className="result-section"><h3>Payload type</h3><p>{assessment.payloadType}</p></div>
              <div className="result-section"><h3>Observed indicators</h3>
                {assessment.deterministicObservations.length ? <ul>{assessment.deterministicObservations.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>No obvious structural indicators found.</p>}
              </div>
              <div className="result-section"><h3>AI assessment</h3>
                {assessment.evidence.length ? <ul>{assessment.evidence.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>No specific indicators returned.</p>}
              </div>
              <div className="result-section uncertainty"><h3>What we can't confirm</h3><p>{assessment.uncertainty}</p></div>
              <div className="result-section action-section"><h3>Safer next steps</h3><ul>{assessment.recommendedAction.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
              <p className="disclaimer">{assessment.disclaimer}</p>
            </div>
          )}
        </div>
      </section>

      <footer><span>PhishLens AI <span className="footer-dot">·</span> Hack Day MVP</span><span>Inspect, don't assume.</span></footer>
    </main>
  );
}
