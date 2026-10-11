import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");

test("no skill file contains literal \\n escape sequences in numbered lists", async () => {
  const dirs = (await readdir(SKILLS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  assert.ok(dirs.length > 0);

  const offenders = [];
  for (const dir of dirs) {
    const text = await readFile(path.join(SKILLS_DIR, dir, "SKILL.md"), "utf8");
    // Look for "\\n" followed by a digit-dot (numbered list continuation)
    if (/\\n\d+\./.test(text)) {
      offenders.push(dir);
    }
  }
  assert.deepEqual(offenders, [], `skills with \\n escape bug: ${offenders.join(", ")}`);
});

test("no adapter file contains literal \\n escape sequences in numbered lists", async () => {
  const ADAPTERS_DIR = path.join(ROOT, "adapters");
  const dirs = (await readdir(ADAPTERS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  assert.ok(dirs.length > 0);

  const offenders = [];
  for (const dir of dirs) {
    const text = await readFile(path.join(ADAPTERS_DIR, dir, "SKILL.md"), "utf8");
    if (/\\n\d+\./.test(text)) {
      offenders.push(dir);
    }
  }
  assert.deepEqual(offenders, [], `adapters with \\n escape bug: ${offenders.join(", ")}`);
});
