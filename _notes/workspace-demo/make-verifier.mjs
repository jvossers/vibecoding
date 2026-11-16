#!/usr/bin/env node
// Sets the passphrase verifier in workspace-demo/index.html.
//
// Usage (from the repo root):
//   DEMO_PASSPHRASE='your passphrase' node _notes/workspace-demo/make-verifier.mjs
//
// The passphrase is read from the environment only. It is never written to disk
// or printed. The script generates a fresh random salt, derives a PBKDF2-SHA-256
// verifier and replaces the GATE block between the /*GATE-START*/ and /*GATE-END*/
// markers. Matching is case-insensitive and ignores extra spaces, exactly as the
// page normalises the entered passphrase.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pbkdf2Sync, randomBytes } from "node:crypto";

const ITERATIONS = 310000;
const pass = process.env.DEMO_PASSPHRASE;
if (!pass || !pass.trim()) {
  console.error("Set DEMO_PASSPHRASE in the environment first.");
  process.exit(1);
}
const normalised = pass.normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
const salt = randomBytes(16);
const verifier = pbkdf2Sync(Buffer.from(normalised, "utf8"), salt, ITERATIONS, 32, "sha256").toString("hex");

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "workspace-demo", "index.html");
const html = readFileSync(file, "utf8");
const re = /\/\*GATE-START\*\/[\s\S]*?\/\*GATE-END\*\//;
if (!re.test(html)) {
  console.error("GATE markers not found in workspace-demo/index.html.");
  process.exit(1);
}
const gate = JSON.stringify({ salt: salt.toString("hex"), iterations: ITERATIONS, verifier });
writeFileSync(file, html.replace(re, `/*GATE-START*/${gate}/*GATE-END*/`));
console.log("Verifier updated in workspace-demo/index.html.");
