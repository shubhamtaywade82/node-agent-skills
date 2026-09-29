import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = await readFile(new URL("../skill-manifest.yml", import.meta.url), "utf8");
const skills = [
  "node-file-system-safety","node-temp-file-safety","node-path-traversal-defense",
  "node-runtime-feature-detection","node-process-supervision","node-memory-leak-diagnostics",
  "node-heap-diagnostics","node-event-loop-diagnostics","node-log-redaction",
  "node-telemetry-sampling","node-cardinality-control","node-trace-context-propagation",
  "node-read-replica-routing","node-query-plan-engineering","node-index-engineering",
  "node-postgres-locking","node-advisory-locks","node-api-content-negotiation",
  "node-http-cache-semantics","node-api-conditional-requests"
];
test("Wave 13 skills have files and evaluation coverage", async () => {
 const evals=await readFile(new URL("../evals/cases/runtime-db-diagnostics/workflow.yml",import.meta.url),"utf8");
 for(const skill of skills){
  assert.match(manifest,new RegExp("^  - name: "+skill+"$","m"));
  const text=await readFile(new URL("../skills/"+skill+"/SKILL.md",import.meta.url),"utf8");
  assert.match(text,new RegExp("^name: "+skill+"$","m"));
  assert.match(evals,new RegExp("skill: "+skill,"m"));
 }
 assert.equal([...manifest.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].length,246);
});
