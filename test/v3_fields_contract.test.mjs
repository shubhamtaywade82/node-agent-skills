import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  parseManifest,
  listSkills,
  loadSkillText,
  routePrompt,
} from "../lib/skill-loader.mjs";
import {
  parseSkillEntries,
  parsePackEnvelope,
  parseCrossPackSection,
  languageFor,
  languageMatches,
  languageAdjustedScore,
  tokenizePrompt,
  scoreTriggers,
} from "../lib/cross-pack-manifest.mjs";
import { validateManifestV3 } from "../lib/v3-schema.mjs";

const manifestText = await readFile(
  new URL("../skill-manifest.yml", import.meta.url),
  "utf8",
);

test("manifest declares schema_version 3 and a pack envelope", async () => {
  const { pack, schema_version } = await parseManifest();
  assert.equal(schema_version, 3);
  assert.equal(pack.name, "node-agent-skills");
  assert.equal(pack.language.toLowerCase(), "typescript");
  assert.ok(pack.runtime);
});

test("parseManifest returns v3 fields on the node-ruby-integration seam skill", async () => {
  const { skills } = await parseManifest();
  const seam = skills.find((skill) => skill.name === "node-ruby-integration");
  assert.ok(seam, "seam skill missing from manifest");
  assert.equal(seam.language, "typescript");
  assert.equal(seam.family, "integration");
  assert.equal(seam.path, "skills/node-ruby-integration/SKILL.md");
  assert.equal(seam.version, "1.0.0");
  assert.equal(seam.schema_version, 3);
  assert.deepEqual(seam.companion_owners, [
    "ruby-agent-skills/rails-node-integration",
    "ruby-agent-skills/rails-action-controller",
    "ruby-agent-skills/rails-active-record",
  ]);
});

test("listSkills exposes v3 fields on v3-aware entries", async () => {
  const all = await listSkills();
  const seam = all.find((skill) => skill.name === "node-ruby-integration");
  assert.equal(seam.language, "typescript");
  assert.equal(seam.companion_owners.length, 3);
});

test("loadSkillText resolves the seam skill (path override compatible)", async () => {
  const text = await loadSkillText("node-ruby-integration");
  assert.ok(text);
  assert.match(text, /^name: node-ruby-integration$/m);
});

test("routePrompt accepts activeFile and reports active_language", async () => {
  const result = await routePrompt(
    "add a migration for the orders table with an index",
    null,
    { activeFile: "app/models/order.rb" },
  );
  assert.equal(result.active_language, "ruby");
  // Within this pack every skill inherits the TypeScript pack language, so a
  // Ruby active file demotes all candidates (x0.5) — weaker but still routed.
  assert.ok(result.primary, "primary should still resolve within a single pack");
});

test("routePrompt language boost strengthens matching candidates", async () => {
  const plain = await routePrompt("add a migration with an index", null);
  const ts = await routePrompt("add a migration with an index", null, { activeFile: "src/order.ts" });
  assert.equal(ts.active_language, "typescript");
  assert.equal(plain.primary, ts.primary, "boosting must not change the single-pack primary");
});

test("routePrompt default behavior is unchanged (no active language)", async () => {
  const result = await routePrompt(
    "add a PostgreSQL transaction with an index and a connection pool",
    null,
  );
  assert.equal(result.active_language, null);
  assert.equal(result.primary, "node-postgresql-persistence");
});

test("parseSkillEntries parses the node manifest's sequence form", () => {
  const skills = parseSkillEntries(manifestText);
  assert.equal(skills.length, 340); // 228 skills + 112 adapter_skills
  const seam = skills.find((skill) => skill.name === "node-ruby-integration");
  assert.equal(seam.language, "typescript");
  assert.equal(seam.path, "skills/node-ruby-integration/SKILL.md");
  assert.ok(seam.triggers.includes("Node to Rails"));
});

test("parseCrossPackSection returns companions and seam contracts", () => {
  const crossPack = parseCrossPackSection(manifestText);
  assert.ok(crossPack);
  assert.equal(crossPack.schema_version, 3);
  const packs = crossPack.companions.map((companion) => companion.pack);
  assert.ok(packs.includes("ruby-agent-skills"));
  assert.ok(packs.includes("react-agent-skills"));
  const nodeSeam = crossPack.seam_contracts.find(
    (seam) => seam.boundary === "node-to-ruby-backend",
  );
  assert.equal(nodeSeam.primary_in_this_pack, "node-ruby-integration");
  assert.equal(nodeSeam.companion_side, "ruby-agent-skills/skills/rails-node-integration");
  assert.deepEqual(nodeSeam.secondary_in_this_pack, [
    "node-rest-api-design",
    "node-postgresql-persistence",
    "node-runtime-validation",
  ]);
});

test("language helpers map files to languages and match the JS family", () => {
  assert.equal(languageFor("app/models/order.rb"), "ruby");
  assert.equal(languageFor("src/order.ts"), "typescript");
  assert.equal(languageFor("src/component.jsx"), "javascript");
  assert.equal(languageFor("Gemfile"), "ruby");
  assert.equal(languageFor("package.json"), "javascript");
  assert.equal(languageFor("README.md"), null);
  assert.ok(languageMatches("typescript", "javascript"));
  assert.ok(languageMatches("TypeScript", "typescript"));
  assert.ok(!languageMatches("ruby", "typescript"));
  assert.equal(languageAdjustedScore(2, "ruby", "ruby"), 4);
  assert.equal(languageAdjustedScore(2, "ruby", "typescript"), 1);
  assert.equal(languageAdjustedScore(2, null, "ruby"), 2);
});

test("tokenizePrompt and scoreTriggers mirror the loader's scoring", () => {
  const tokens = tokenizePrompt("Add a Postgres transaction with an index");
  assert.deepEqual(tokens, ["add", "a", "postgres", "transaction", "with", "an", "index"]);
  assert.equal(scoreTriggers(["postgres"], tokens), 1);
  assert.equal(scoreTriggers(["connection pool"], tokens), 0);
  assert.equal(scoreTriggers(["postgres", "index"], tokens), 2);
});

test("validateManifestV3 passes on this pack's manifest", () => {
  const { errors, warnings } = validateManifestV3(manifestText);
  assert.deepEqual(errors, [], `unexpected schema errors: ${errors.join("; ")}`);
  // The node manifest's pack.language is "TypeScript" (capitalized) — the
  // validator normalizes case, so no warning is expected either.
  assert.deepEqual(warnings, [], `unexpected schema warnings: ${warnings.join("; ")}`);
});

test("validateManifestV3 catches structural defects", () => {
  const broken = [
    "version: 1",
    "pack:",
    "  name: broken-pack",
    "skills:",
    "  - name: broken-skill",
    "    category: test",
    "    triggers: [test]",
    "    version: not-semver",
    "    schema_version: 2",
    "    companion_owners:",
    "      - malformed-owner",
    "cross_pack:",
    "  schema_version: 3",
    "  companions:",
    "    - pack: some-pack",
    "      repo: http://not-https.example.com",
    "      pinned_ref: main",
    "      language: ruby",
    "  seam_contracts:",
    "    - boundary: broken-seam",
    "      primary_in_this_pack: does-not-exist",
    "      companion_pack: some-pack",
    "      companion_side: some-pack/skills/some-skill",
  ].join("\n");
  const { errors } = validateManifestV3(broken);
  const messages = errors.join("\n");
  assert.ok(messages.includes("schema_version missing"), "should flag missing v3 marker");
  assert.ok(messages.includes("pack.language missing"));
  assert.ok(messages.includes("not semver"));
  assert.ok(messages.includes("schema_version is 2"));
  assert.ok(messages.includes("companion_owner \"malformed-owner\""));
  assert.ok(messages.includes("repo must be an https URL"));
  assert.ok(messages.includes("is not a registered skill"));
});
