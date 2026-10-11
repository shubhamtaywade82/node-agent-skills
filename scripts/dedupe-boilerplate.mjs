#!/usr/bin/env node
/**
 * De-duplicate shared boilerplate across skill files. For each skill that
 * contains the canonical "shared" lines, remove the duplicated lines and
 * append a pointer line to references/agent-discipline.md.
 *
 * Idempotent: if a skill already references the file, it is skipped.
 *
 * Conservative: removes ONLY lines that exactly match (after trim) one of
 * the shared canonical lines. Does not remove lines that merely contain the
 * shared text embedded in a longer sentence.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");

const SHARED_LINES = [
  "Hidden coupling, unbounded resource use, or silent fallback.",
  "Tests that prove implementation details instead of the observable contract.",
  "Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.",
  "Detect exact dependency versions before using version-specific APIs.",
  "Treat external input and resource state as untrusted runtime data.",
  "Preserve existing contracts unless the task explicitly changes them.",
  "Prefer the smallest design that makes ownership, failure, and observability explicit.",
  "Run lint/typecheck/build/deployment gates defined by the repository.",
  "Add or update focused tests before implementing behavior changes.",
  "Verify failure paths, cleanup, and compatibility behavior.",
  "Run focused tests, then the full repository test suite.",
  "Record assumptions, risks, and rollback implications.",
];

const REFERENCE_LINE =
  "See references/agent-discipline.md for the shared lines that were removed from this section.";

const sharedSet = new Set(SHARED_LINES.map((l) => l.trim()));

let deduped = 0;
let skipped = 0;
let totalLinesRemoved = 0;

const dirs = (await readdir(SKILLS_DIR, { withFileTypes: true })).filter((e) => e.isDirectory());

for (const dir of dirs) {
  const file = path.join(SKILLS_DIR, dir.name, "SKILL.md");
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("references/agent-discipline.md")) {
    skipped += 1;
    continue;
  }
  const lines = text.split("\n");
  const kept = [];
  let removedHere = 0;
  for (const line of lines) {
    const stripped = line.replace(/^[-\s]*/, "").trim(); // remove leading "- " or whitespace
    if (sharedSet.has(stripped)) {
      removedHere += 1;
      continue; // drop this line
    }
    kept.push(line);
  }
  if (removedHere === 0) continue;

  let modified = kept.join("\n");
  // Tidy 3+ blank lines down to 2.
  modified = modified.replace(/\n{3,}/g, "\n\n");
  // Append the reference line near the end.
  modified = modified.trimEnd() + "\n\n" + REFERENCE_LINE + "\n";

  await writeFile(file, modified, "utf8");
  deduped += 1;
  totalLinesRemoved += removedHere;
}

console.log(`De-duplicated ${deduped} skill files; skipped ${skipped} already-referencing. Total shared lines removed: ${totalLinesRemoved}.`);
