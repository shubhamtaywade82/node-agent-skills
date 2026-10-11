import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  parseManifest,
  listSkills,
  listAdapters,
  loadSkillText,
  routePrompt,
  resolveSecondaries,
  detectAdapters,
} from "../lib/skill-loader.mjs";

test("parseManifest returns 330 skills and 95 adapters", async () => {
  const { skills, adapters } = await parseManifest();
  assert.equal(skills.length, 330);
  assert.equal(adapters.length, 95);
  for (const skill of skills) {
    assert.ok(skill.name, "skill has a name");
    assert.ok(skill.category, `${skill.name}: category missing`);
    assert.ok(Array.isArray(skill.triggers) && skill.triggers.length > 0, `${skill.name}: triggers missing`);
  }
  for (const adapter of adapters) {
    assert.ok(adapter.path.startsWith("adapters/"), `${adapter.name}: path not under adapters/`);
    assert.ok(adapter.version_scope, `${adapter.name}: version_scope missing`);
    assert.ok(adapter.source.startsWith("https://"), `${adapter.name}: source not https`);
  }
});

test("listSkills returns all skills, filter works", async () => {
  const all = await listSkills();
  assert.equal(all.length, 330);
  const architecture = await listSkills("architecture");
  assert.ok(architecture.length > 0);
  assert.ok(architecture.every((s) => s.category === "architecture"));
});

test("listAdapters returns 95 adapters", async () => {
  const adapters = await listAdapters();
  assert.equal(adapters.length, 95);
  const names = new Set(adapters.map((a) => a.name));
  assert.ok(names.has("express"));
  assert.ok(names.has("fastify"));
  assert.ok(names.has("prisma"));
});

test("loadSkillText returns SKILL.md content for a known skill", async () => {
  const text = await loadSkillText("node-architecture");
  assert.ok(text);
  assert.match(text, /^name: node-architecture$/m);
  assert.match(text, /## Purpose/);
});

test("loadSkillText returns null for unknown skill", async () => {
  const text = await loadSkillText("does-not-exist-skill");
  assert.equal(text, null);
});

test("resolveSecondaries returns the registered secondaries", async () => {
  const sec = await resolveSecondaries("node-postgresql-persistence");
  assert.ok(Array.isArray(sec));
  assert.ok(sec.includes("node-testing"));
});

test("resolveSecondaries returns [] for unknown primary", async () => {
  const sec = await resolveSecondaries("no-such-primary");
  assert.deepEqual(sec, []);
});

test("routePrompt routes a Postgres prompt to node-postgresql-persistence", async () => {
  const result = await routePrompt(
    "add a PostgreSQL transaction with an index and a connection pool",
    null,
  );
  assert.equal(result.primary, "node-postgresql-persistence");
  assert.ok(result.secondary.includes("node-testing"));
  assert.ok(result.candidates.length > 0);
  assert.equal(result.candidates[0], "node-postgresql-persistence");
});

test("routePrompt routes an HTTP prompt to node-http-engineering", async () => {
  const result = await routePrompt("add an HTTP middleware handler for the REST endpoint", null);
  assert.ok(
    ["node-http-engineering", "node-rest-api-design", "node-api-engineering"].includes(result.primary),
    `unexpected primary: ${result.primary}`,
  );
});

test("routePrompt returns null primary for empty prompt", async () => {
  const result = await routePrompt("", null);
  assert.equal(result.primary, null);
  assert.deepEqual(result.candidates, []);
});

test("detectAdapters detects express in a fixture package.json", async () => {
  const fixtureDir = path.resolve(import.meta.dirname, "fixtures");
  const adapters = await listAdapters();
  const detected = await detectAdapters(fixtureDir, adapters);
  const names = detected.map((a) => a.name);
  assert.ok(names.includes("express"), "express not detected");
  assert.ok(names.includes("prisma"), "prisma not detected");
  assert.ok(names.includes("zod"), "zod not detected");
});

test("detectAdapters returns [] for nonexistent repo path", async () => {
  const adapters = await listAdapters();
  const detected = await detectAdapters("/no/such/path/anywhere", adapters);
  assert.deepEqual(detected, []);
});

test("routePrompt includes adapters when repo path is provided", async () => {
  const fixtureDir = path.resolve(import.meta.dirname, "fixtures");
  const result = await routePrompt(
    "add a Postgres transaction",
    fixtureDir,
  );
  assert.ok(Array.isArray(result.adapters));
  assert.ok(result.adapters.some((a) => a.name === "prisma"));
});

test("routePrompt returns null adapters when repo path is null", async () => {
  const result = await routePrompt("any prompt", null);
  assert.deepEqual(result.adapters, []);
});
