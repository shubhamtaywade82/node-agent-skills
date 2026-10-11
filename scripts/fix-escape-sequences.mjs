#!/usr/bin/env node
/**
 * Fix literal \\n escape sequences inside SKILL.md Implementation procedure
 * sections. The bug renders numbered lists as single broken paragraphs.
 *
 * Pattern: "1. Foo.\\n2. Bar.\\n3. Baz." → real newlines.
 *
 * Only fixes lines that contain a numbered list joined by \\n. Does not
 * touch code blocks or YAML frontmatter.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SKILLS_DIR = path.join(ROOT, "skills");

const ESCAPE_PATTERN = /(\d+\.\s[^\n\\]+)\\n(\d+\.\s)/g;

let fixedCount = 0;
let fileCount = 0;

const dirs = (await readdir(SKILLS_DIR, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

for (const dir of dirs) {
  const file = path.join(SKILLS_DIR, dir, "SKILL.md");
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    continue;
  }
  if (!text.includes("\\n")) continue;

  const before = text;
  // Replace \n that sits between two numbered list items
  text = text.replace(ESCAPE_PATTERN, (_match, p1, p2) => `${p1}\n${p2}`);
  // Also handle remaining trailing \n sequences in numbered lists
  text = text.replace(/\\n(?=\d+\.\s)/g, "\n");

  if (text === before) continue;

  await writeFile(file, text, "utf8");
  fileCount += 1;
  fixedCount += (before.match(/\\n/g) || []).length - (text.match(/\\n/g) || []).length;
}

console.log(`Fixed ${fixedCount} \\n escape sequences across ${fileCount} skill files.`);
