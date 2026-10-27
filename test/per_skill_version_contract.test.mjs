import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await readFile(path.join(ROOT, "skill-manifest.yml"), "utf8");

test("every registered skill has a version field", () => {
  const skills = [...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((m) => m[1]);
  assert.equal(skills.length, 340);
  const versions = [...manifest.matchAll(/^    version: (\d+\.\d+\.\d+)$/gm)];
  assert.equal(versions.length, skills.length, "every skill must have a version field");
  for (const match of versions) {
    const [major, minor, patch] = match[1].split(".").map(Number);
    assert.ok(major >= 0 && minor >= 0 && patch >= 0, `invalid version: ${match[1]}`);
  }
});

test("version field appears on its own line, not blank-prefixed", () => {
  // No blank line should appear immediately before "    version:"
  const lines = manifest.split("\n");
  for (let i = 1; i < lines.length; i += 1) {
    if (/^    version: /.test(lines[i])) {
      assert.notEqual(lines[i - 1].trim(), "", `blank line before version at line ${i}`);
    }
  }
});

test("every version field is semver-formatted (MAJOR.MINOR.PATCH)", () => {
  const versions = [...manifest.matchAll(/^    version: (\d+\.\d+\.\d+)$/gm)];
  assert.ok(versions.length > 0);
  for (const match of versions) {
    assert.match(match[1], /^\d+\.\d+\.\d+$/, `invalid semver: ${match[1]}`);
  }
});

test("adapters do not have a per-skill version field (they use version_scope)", () => {
  // Adapter entries start with "  <name>:" and have "    version_scope:" lines.
  // They must NOT have "    version:" lines.
  const lines = manifest.split("\n");
  let inAdapter = false;
  for (let i = 0; i < lines.length; i += 1) {
    if (/^  [a-z0-9-]+:$/.test(lines[i])) {
      inAdapter = true;
      continue;
    }
    if (/^  - name: /.test(lines[i])) {
      inAdapter = false;
      continue;
    }
    if (inAdapter && /^    version: /.test(lines[i])) {
      assert.fail(`adapter has a "version" field at line ${i + 1}: ${lines[i]}`);
    }
  }
});
