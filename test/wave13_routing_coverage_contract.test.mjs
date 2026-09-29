import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");
const routing = await readFile(new URL("../router/ROUTING_CASES.yml", import.meta.url), "utf8");

test("every registered core skill has an explicit primary routing case", () => {
  const skills = new Set([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map(m => m[1]));
  const primary = new Set([...routing.matchAll(/^    primary: ([a-z0-9-]+)$/gm)].map(m => m[1]));
  const missing = [...skills].filter(skill => !primary.has(skill));
  assert.deepEqual(missing, [], "skills without primary routing ownership: " + missing.join(", "));
});
