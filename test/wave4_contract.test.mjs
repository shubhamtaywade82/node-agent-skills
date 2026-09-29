import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
const skills=["node-domain-modeling","node-hexagonal-architecture","node-dependency-injection","node-module-boundaries","node-integration-testing","node-e2e-testing","node-testcontainers","node-load-testing","node-api-client-engineering","node-file-uploads","node-scheduling","node-multi-tenancy","node-audit-logging","node-data-privacy"];
for(const skill of skills)test(skill+" has owner and eval",async()=>{const m=await readFile("skill-manifest.yml","utf8");assert.match(m,new RegExp("^  - name: "+skill+"$","m"));await access("skills/"+skill+"/SKILL.md");await access("evals/cases/application/"+skill.replace(/^node-/,"")+".yml")});
test("Wave 4 adapters are registered",async()=>{const m=await readFile("skill-manifest.yml","utf8");for(const n of ["vitest","jest","testcontainers","playwright"]){assert.match(m,new RegExp("^  "+n+":$","m"));await access("adapters/"+n+"/SKILL.md");await access("adapters/"+n+"/README.md")}});
test("Wave 4 target is 77 skills",async()=>{const m=await readFile("skill-manifest.yml","utf8");assert.equal([...m.matchAll(/^  - name: /gm)].length,77)});
