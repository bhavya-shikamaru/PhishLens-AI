import test from "node:test";
import assert from "node:assert/strict";
import {
  parseJsonObject,
  stringArray,
  normaliseRisk,
  VALID_RISKS,
  DISCLAIMER,
} from "./analyzeHelpers.js";

// ── parseJsonObject ──────────────────────────────────────────────────────────

test("parseJsonObject: extracts a plain JSON object", () => {
  const result = parseJsonObject('{"risk":"LOW","payloadType":"HTTP(S) URL"}');
  assert.ok(result !== null);
  assert.equal(result?.risk, "LOW");
});

test("parseJsonObject: strips leading markdown fence (```json)", () => {
  const fenced = "```json\n{\"risk\":\"HIGH\"}\n```";
  const result = parseJsonObject(fenced);
  assert.ok(result !== null);
  assert.equal(result?.risk, "HIGH");
});

test("parseJsonObject: strips plain ``` fence", () => {
  const fenced = "```\n{\"risk\":\"MEDIUM\"}\n```";
  const result = parseJsonObject(fenced);
  assert.ok(result !== null);
  assert.equal(result?.risk, "MEDIUM");
});

test("parseJsonObject: returns null for empty string", () => {
  assert.equal(parseJsonObject(""), null);
});

test("parseJsonObject: returns null for prose without JSON", () => {
  assert.equal(parseJsonObject("I cannot assess this URL."), null);
});

test("parseJsonObject: returns null for malformed JSON", () => {
  assert.equal(parseJsonObject("{risk: LOW}"), null);
});

test("parseJsonObject: extracts JSON embedded in surrounding prose", () => {
  const prose = 'Here is my assessment: {"risk":"UNKNOWN","payloadType":"text"} — treat with caution.';
  const result = parseJsonObject(prose);
  assert.ok(result !== null);
  assert.equal(result?.risk, "UNKNOWN");
});

// ── stringArray ──────────────────────────────────────────────────────────────

test("stringArray: returns items from a valid string array", () => {
  const result = stringArray(["foo", "bar"], ["fallback"]);
  assert.deepEqual(result, ["foo", "bar"]);
});

test("stringArray: filters out non-string items", () => {
  const result = stringArray(["ok", 42, null, "also ok"], ["fallback"]);
  assert.deepEqual(result, ["ok", "also ok"]);
});

test("stringArray: uses fallback for non-array input", () => {
  assert.deepEqual(stringArray("not an array", ["fallback"]), ["fallback"]);
  assert.deepEqual(stringArray(null, ["fallback"]), ["fallback"]);
  assert.deepEqual(stringArray(undefined, ["fallback"]), ["fallback"]);
});

test("stringArray: uses fallback when array is empty after filtering", () => {
  assert.deepEqual(stringArray([1, 2, 3], ["fallback"]), ["fallback"]);
});

test("stringArray: caps individual item length at 400 characters", () => {
  const long = "x".repeat(500);
  const result = stringArray([long], ["fallback"]);
  assert.equal(result[0]?.length, 400);
});

test("stringArray: caps output at 8 items", () => {
  const many = Array.from({ length: 12 }, (_, i) => `item${i}`);
  const result = stringArray(many, ["fallback"]);
  assert.equal(result.length, 8);
});

// ── normaliseRisk ────────────────────────────────────────────────────────────

test("normaliseRisk: accepts valid risk values case-insensitively", () => {
  assert.equal(normaliseRisk("LOW"), "LOW");
  assert.equal(normaliseRisk("medium"), "MEDIUM");
  assert.equal(normaliseRisk("High"), "HIGH");
  assert.equal(normaliseRisk("UNKNOWN"), "UNKNOWN");
});

test("normaliseRisk: coerces unknown values to UNKNOWN", () => {
  assert.equal(normaliseRisk("SAFE"), "UNKNOWN");
  assert.equal(normaliseRisk(""), "UNKNOWN");
  assert.equal(normaliseRisk(null), "UNKNOWN");
  assert.equal(normaliseRisk(undefined), "UNKNOWN");
  assert.equal(normaliseRisk(42), "UNKNOWN");
});

test("normaliseRisk: all VALID_RISKS members round-trip", () => {
  for (const r of VALID_RISKS) {
    assert.equal(normaliseRisk(r), r);
  }
});

// ── DISCLAIMER ───────────────────────────────────────────────────────────────

test("DISCLAIMER: does not claim safety", () => {
  // The disclaimer must not say a LOW rating IS safe
  assert.ok(!DISCLAIMER.toLowerCase().includes("is safe"));
  // It should mention that a LOW rating doesn't guarantee safety
  assert.ok(DISCLAIMER.toLowerCase().includes("low rating does not guarantee safety"));
});

test("DISCLAIMER: encourages official verification", () => {
  assert.ok(DISCLAIMER.toLowerCase().includes("official channel"));
});
