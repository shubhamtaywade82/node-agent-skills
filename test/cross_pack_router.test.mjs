import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { routeCrossPack, discoverPackRoots } from "../lib/cross-pack-router.mjs";

// A minimal companion pack in the ruby mapping form, exercising both manifest
// entry shapes the cross-pack parser must support.
const COMPANION_MANIFEST = [
  "schema_version: 3",
  "version: 2",
  "name: fixture-ruby-pack",
  "pack:",
  "  name: fixture-ruby-pack",
  "  language: ruby",
  "  runtime: MRI 3.2",
  "skills:",
  "  fixture-active-record:",
  "    family: rails",
  "    path: skills/fixture-active-record/SKILL.md",
  "    triggers: [Active Record, migration, index, scope, model]",
  "    version: 1.0.0",
  "    language: ruby",
  "  fixture-node-integration:",
  "    family: rails",
  "    path: skills/fixture-node-integration/SKILL.md",
  "    triggers: [Rails to Node, Node service consuming Rails, Rails API consumed by Node, problem json]",
  "    version: 1.0.0",
  "    language: ruby",
  "cross_pack:",
  "  schema_version: 3",
  "  companions:",
  "    - pack: node-agent-skills",
  "      repo: https://github.com/shubhamtaywade82/node-agent-skills",
  "      pinned_ref: main",
  "      language: typescript",
  "  name_collisions: []",
  "  seam_contracts:",
  "    - boundary: fixture-to-node-backend",
  "      primary_in_this_pack: fixture-node-integration",
  "      secondary_in_this_pack:",
  "        - fixture-active-record",
  "      companion_pack: node-agent-skills",
  "      companion_side: node-agent-skills/skills/node-ruby-integration",
].join("\n");

async function createFixturePack() {
  const dir = await mkdtemp(path.join(tmpdir(), "fixture-pack-"));
  await mkdir(path.join(dir, "skills", "fixture-active-record"), { recursive: true });
  await mkdir(path.join(dir, "skills", "fixture-node-integration"), { recursive: true });
  await writeFile(path.join(dir, "skill-manifest.yml"), COMPANION_MANIFEST, "utf8");
  await writeFile(
    path.join(dir, "skills", "fixture-active-record", "SKILL.md"),
    "---\nname: fixture-active-record\ndescription: Use when fixture.\n---\n# Fixture\n",
    "utf8",
  );
  await writeFile(
    path.join(dir, "skills", "fixture-node-integration", "SKILL.md"),
    "---\nname: fixture-node-integration\ndescription: Use when fixture seam.\n---\n# Fixture seam\n",
    "utf8",
  );
  return dir;
}

test("routeCrossPack routes a migration prompt with language bias", async () => {
  const fixtureRoot = await createFixturePack();
  try {
    const options = { packs: [fixtureRoot] };

    // Ruby active file: the fixture (ruby) pack wins despite the same prompt.
    const ruby = await routeCrossPack(
      "add a migration for the orders table with an index",
      { ...options, file: "app/models/order.rb" },
    );
    assert.equal(ruby.active_language, "ruby");
    assert.equal(ruby.primary.pack, "fixture-ruby-pack");
    assert.equal(ruby.primary.name, "fixture-active-record");

    // TypeScript active file: this pack (node) wins the same prompt.
    const ts = await routeCrossPack(
      "add a migration for the orders table with an index",
      { ...options, file: "src/order.ts" },
    );
    assert.equal(ts.active_language, "typescript");
    assert.equal(ts.primary.pack, "node-agent-skills");
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("routeCrossPack recommends the seam contract for cross-stack prompts", async () => {
  const fixtureRoot = await createFixturePack();
  try {
    const result = await routeCrossPack(
      "the Node service consumes the Rails orders API and maps problem json errors",
      { packs: [fixtureRoot] },
    );
    // The fixture's seam skill must surface with its declared contract,
    // looked up from the OWNING (fixture) pack's cross_pack section.
    assert.ok(result.seam.recommended);
    assert.equal(result.seam.boundary, "fixture-to-node-backend");
    assert.equal(result.seam.this_pack_seam, "fixture-node-integration");
    assert.equal(result.seam.companion_side, "node-agent-skills/skills/node-ruby-integration");
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("routeCrossPack consults both packs and reports per-pack primaries", async () => {
  const fixtureRoot = await createFixturePack();
  try {
    const result = await routeCrossPack("add a migration with an index", { packs: [fixtureRoot] });
    // At least the fixture pack and this pack; sibling-directory discovery may
    // also find real companion checkouts when they exist next to this repo.
    assert.ok(result.packs_consulted.length >= 2);
    assert.ok(result.packs_consulted.includes("fixture-ruby-pack"));
    assert.ok(result.packs_consulted.includes("node-agent-skills"));
    for (const pack of result.packs) {
      assert.ok(pack.primary, `${pack.pack.name} should have a primary`);
      assert.ok(Array.isArray(pack.candidates) && pack.candidates.length > 0);
    }
    assert.ok(result.candidates.length > 0);
    assert.ok(result.candidates.every((candidate) => candidate.pack && candidate.name));
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("routeCrossPack surfaces companion_owners of the overall primary", async () => {
  const result = await routeCrossPack(
    "the Node BFF calls the Rails orders API and maps 422 validation errors into problem json",
    { file: "src/bff.ts" },
  );
  // This run consults whatever packs are discoverable from the environment
  // (sibling directories in a checkout). Whichever v3-aware seam skill wins,
  // its declared companion_owners must be surfaced verbatim.
  const declared = {
    "node-ruby-integration": [
      "ruby-agent-skills/rails-node-integration",
      "ruby-agent-skills/rails-action-controller",
      "ruby-agent-skills/rails-active-record",
    ],
    "node-react-integration": [
      "react-agent-skills/browser-authentication",
      "react-agent-skills/react-data-fetching",
      "react-agent-skills/react-forms-validation",
    ],
  };
  const expected = declared[result.primary?.name];
  if (expected) {
    assert.deepEqual(result.companion_owners, expected);
  } else {
    assert.equal(result.companion_owners.length, 0);
  }
});

test("discoverPackRoots honors explicit packs and always includes this pack", async () => {
  const fixtureRoot = await createFixturePack();
  try {
    const roots = discoverPackRoots([fixtureRoot]);
    assert.ok(roots.includes(fixtureRoot));
    assert.ok(roots.some((root) => root.endsWith(path.sep + "node-agent-skills") || root.endsWith("node-agent-skills")));
    // Non-manifest directories are filtered out.
    const bogus = path.join(fixtureRoot, "not-a-pack");
    await mkdir(bogus, { recursive: true });
    const filtered = discoverPackRoots([bogus, fixtureRoot]);
    assert.ok(!filtered.includes(bogus));
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
