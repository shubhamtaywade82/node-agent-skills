import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");

const skills = [
  "node-grpc",
  "node-rpc-contracts",
  "node-api-gateway",
  "node-service-mesh",
  "node-message-delivery",
  "node-schema-registry",
  "node-consumer-rebalancing",
  "node-authorization-models",
  "node-threat-modeling",
  "node-secure-coding",
  "node-legacy-modernization",
  "node-change-impact-analysis",
  "node-migration-assistant",
  "node-architecture-decision-records",
  "node-test-data-management",
  "node-flaky-test-engineering",
  "node-test-environment-engineering",
  "node-api-deprecation",
];

const adapters = [
  "grpc-js",
  "protobufjs",
  "amqplib",
  "nats",
  "aws-sqs",
  "aws-sns",
  "aws-dynamodb",
  "opensearch",
  "elasticsearch",
  "azure-sdk",
  "google-cloud",
];

test("Wave 6 skills have files and evaluation coverage", async () => {
  const evals = await readFile(new URL("../evals/cases/advanced-services/workflow.yml", import.meta.url), "utf8").catch(() => "");
  for (const skill of skills) {
    assert.match(manifest, new RegExp(`^  - name: ${skill}$`, "m"));
    const text = await readFile(new URL(`../skills/${skill}/SKILL.md`, import.meta.url), "utf8");
    assert.match(text, new RegExp(`^name: ${skill}$`, "m"));
    assert.match(evals, new RegExp(`skill: ${skill}`, "m"));
  }
  assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length, 246);
});

test("Wave 6 adapters have registry, skill, README, and source metadata", async () => {
  for (const name of adapters) {
    assert.match(manifest, new RegExp(`^  ${name}:\\n    path: adapters/${name}/SKILL\\.md\\n    version_scope: .+\\n    source: https://`, "m"));
    const skill = await readFile(new URL(`../adapters/${name}/SKILL.md`, import.meta.url), "utf8");
    const readme = await readFile(new URL(`../adapters/${name}/README.md`, import.meta.url), "utf8");
    assert.ok(skill.length > 100);
    assert.ok(readme.length > 50);
  }
});
