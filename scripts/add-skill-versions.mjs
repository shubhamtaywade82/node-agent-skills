#!/usr/bin/env node
/**
 * Add `version: 0.1.0` to every skill entry in skill-manifest.yml
 * that doesn't already have one. Idempotent.
 *
 * A skill entry starts with `^  - name: ` and ends at the next line
 * that matches `^  - name: ` (next skill) or `^  [a-z0-9-]+:$`
 * (an adapter entry) or EOF.
 *
 * Adapter entries (e.g. `  express:\n    path: ...`) are left untouched.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = path.join(ROOT, "skill-manifest.yml");

const text = await readFile(MANIFEST, "utf8");
const lines = text.split("\n");

let modified = 0;
const out = [];

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  out.push(line);
  if (!/^  - name: /.test(line)) continue;

  // Find block end: next skill start, adapter entry, or non-indented line, or EOF.
  let blockEnd = lines.length;
  for (let k = i + 1; k < lines.length; k += 1) {
    const next = lines[k];
    if (/^  - name: /.test(next)) { blockEnd = k; break; }
    if (/^  [a-z0-9-]+:$/.test(next)) { blockEnd = k; break; }
    if (/^[a-z]/.test(next)) { blockEnd = k; break; }
  }

  // Emit the block, checking for an existing version field.
  let hasVersion = false;
  for (let k = i + 1; k < blockEnd; k += 1) {
    if (/^    version: /.test(lines[k])) {
      hasVersion = true;
      break;
    }
  }
  for (let k = i + 1; k < blockEnd; k += 1) {
    out.push(lines[k]);
  }
  if (!hasVersion) {
    out.push("    version: 0.1.0");
    modified += 1;
  }
  i = blockEnd - 1;
}

await writeFile(MANIFEST, out.join("\n"), "utf8");
console.log(`Processed skills; added version field to ${modified} skills.`);
