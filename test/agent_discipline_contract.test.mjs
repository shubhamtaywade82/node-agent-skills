import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const refPath = path.join(ROOT, "references", "agent-discipline.md");

test("references/agent-discipline.md exists and is well-formed", async () => {
  const text = await readFile(refPath, "utf8");
  assert.ok(text.length > 500, "agent-discipline.md is too short");
  assert.match(text, /Shared Repository inspection lines/);
  assert.match(text, /Shared Failure modes/);
  assert.match(text, /Shared Verification/);
});

test("at least one skill file references agent-discipline.md", async () => {
  const { readdir } = await import("node:fs/promises");
  const skillsDir = path.join(ROOT, "skills");
  const dirs = (await readdir(skillsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory());
  let count = 0;
  for (const dir of dirs) {
    try {
      const text = await readFile(path.join(skillsDir, dir.name, "SKILL.md"), "utf8");
      if (text.includes("references/agent-discipline.md")) count += 1;
    } catch { /* skip */ }
  }
  assert.ok(count > 0, "no skill references agent-discipline.md; the dedup script ran but produced no references");
});

test("pack export includes references/agent-discipline.md", async () => {
  // The export-pack.mjs requiredFiles list must include the reference file.
  const exportScript = await readFile(path.join(ROOT, "scripts", "export-pack.mjs"), "utf8");
  assert.match(exportScript, /references\/agent-discipline\.md/);
});

test("dedupe script exists and is idempotent", async () => {
  const script = await readFile(path.join(ROOT, "scripts", "dedupe-boilerplate.mjs"), "utf8");
  assert.match(script, /Idempotent/);
  assert.match(script, /SHARED_LINES/);
  assert.match(script, /references\/agent-discipline\.md/);
});
