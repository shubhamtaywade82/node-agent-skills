#!/usr/bin/env node
/**
 * LLM-as-judge evaluator. Scores agent routing decisions made by an LLM
 * against the existing eval corpus.
 *
 * Usage:
 *   node scripts/eval-llm-judge.mjs --cases evals/cases/api/http.yml
 *   node scripts/eval-llm-judge.mjs --cases evals/cases/api/http.yml --limit 5 --concurrency 2
 *
 * Requires z-ai-web-dev-sdk to be installed (separate from the pack's
 * zero-dependency runtime).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseRoutingCases, validateRoutingCorpus } from "../lib/routing-evaluator.mjs";
import { judgeCorpus } from "../lib/llm-judge.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const casesPath = argument("--cases", path.join(ROOT, "evals/cases/api/http.yml"));
const limit = argument("--limit", null);
const concurrency = Number(argument("--concurrency", "1"));

async function main() {
  const casesText = await readFile(casesPath, "utf8");
  const manifestText = await readFile(path.join(ROOT, "skill-manifest.yml"), "utf8");
  const cases = parseRoutingCases(casesText);

  // Validate corpus.
  const registeredSkills = new Set(
    [...manifestText.matchAll(/^  - name: ([a-z0-9-]+)$/gm)].map((m) => m[1]),
  );
  const registeredAdapters = new Set(
    [...manifestText.matchAll(/^    path: (adapters\/[^\n]+)$/gm)].map((m) => m[1].trim()),
  );
  const corpusErrors = validateRoutingCorpus(cases, registeredSkills, registeredAdapters, {
    requireEvaluationMetadata: false,
  });
  if (corpusErrors.length > 0) {
    console.error(`corpus invalid: ${corpusErrors.join(", ")}`);
    process.exitCode = 1;
    return;
  }

  console.error(`Loaded ${cases.length} cases from ${casesPath}`);

  // Dynamically import z-ai-web-dev-sdk. Optional dependency.
  let ZAI;
  try {
    ZAI = (await import("z-ai-web-dev-sdk")).default;
  } catch {
    console.error("z-ai-web-dev-sdk is not installed. Install it to run the LLM judge.");
    console.error("    npm install z-ai-web-dev-sdk");
    process.exitCode = 2;
    return;
  }

  const zai = await ZAI.create();
  console.error(`LLM client ready; concurrency=${concurrency}${limit ? `, limit=${limit}` : ""}`);

  const summary = await judgeCorpus(cases, zai, { limit: limit ? Number(limit) : null, concurrency });

  console.log(JSON.stringify(summary, null, 2));
  process.exitCode = summary.failed === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error("llm-judge fatal:", err?.message ?? err);
  process.exitCode = 1;
});
