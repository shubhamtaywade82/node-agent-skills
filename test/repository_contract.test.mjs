import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("repository manifest and package agree on the runtime contract", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  const manifest = await readFile("skill-manifest.yml", "utf8");
  assert.equal(pkg.type, "module");
  assert.equal(pkg.engines.node, ">=24");
  assert.equal([...manifest.matchAll(/^  - name: /gm)].length, 329);
  assert.equal([...manifest.matchAll(/^    category: /gm)].length, 329);
  assert.equal([...manifest.matchAll(/^    triggers: /gm)].length, 329);
});
