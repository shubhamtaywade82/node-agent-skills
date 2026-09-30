#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluateRoutingCase,
  parseRoutingCases,
  parseRoutingDecisions,
  summarizeRoutingResults,
  validateRoutingCorpus,
} from "../lib/routing-evaluator.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const casesPath = argument("--cases", path.join(root, "evals/cases/agent-network-security/workflow.yml"));
const decisionsPath = argument("--decisions");

if (!decisionsPath) {
  console.error("usage: node scripts/evaluate-routing.mjs --decisions <jsonl> [--cases <workflow.yml>]");
  process.exitCode = 2;
} else {
  const casesText = await readFile(casesPath, "utf8");
  const decisionsText = await readFile(decisionsPath, "utf8");
  const manifestText = await readFile(path.join(root, "skill-manifest.yml"), "utf8");

  const cases = parseRoutingCases(casesText);
  const registeredSkills = new Set(
    [...manifestText.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((match) => match[1])
  );
  const registeredAdapters = new Set(
    [...manifestText.matchAll(/^    path: (adapters\/[^\n]+)$/gm)].map((match) => match[1].trim())
  );
  const corpusErrors = validateRoutingCorpus(cases, registeredSkills, registeredAdapters);
  if (corpusErrors.length > 0) {
    console.log(JSON.stringify({
      total: cases.length,
      passed: 0,
      failed: cases.length,
      primary_accuracy: 0,
      failures: [{ case: null, errors: corpusErrors, primary: null }],
    }, null, 2));
    process.exitCode = 1;
  } else {
  const corpusNames = new Set(cases.map((caseDefinition) => caseDefinition.name));

  const decisionsResult = parseRoutingDecisions(decisionsText);
  if (!(decisionsResult instanceof Map)) {
    console.log(JSON.stringify({
      total: cases.length,
      passed: 0,
      failed: cases.length,
      primary_accuracy: 0,
      failures: [{ case: null, errors: decisionsResult.errors, primary: null }],
    }, null, 2));
    process.exitCode = 1;
  } else {
  const decisions = decisionsResult;

  const results = cases.map((caseDefinition) => {
    const decision = decisions.get(caseDefinition.name);
    if (!decision) {
      return {
        case: caseDefinition.name,
        pass: false,
        errors: ["DECISION_MISSING"],
        primary: undefined,
      };
    }
    return evaluateRoutingCase(caseDefinition, decision, registeredSkills);
  });

  for (const [caseName, decision] of decisions) {
    if (!corpusNames.has(caseName)) {
      results.push({
        case: caseName,
        pass: false,
        errors: ["UNKNOWN_CASE"],
        primary: decision.primary,
      });
    }
  }

  const report = summarizeRoutingResults(results);
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.failed === 0 ? 0 : 1;
  }
  }
}
