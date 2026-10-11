// lib/llm-judge.mjs
// LLM-as-judge harness that scores agent routing decisions against the
// existing eval corpus (evals/cases/*/workflow.yml). Replaces the
// string-match routing evaluator with an LLM that:
//   1. Reads the prompt from each eval case.
//   2. Considers the registered skill manifest.
//   3. Returns a routing decision (primary + secondary + adapter).
//   4. Compares against the expected skill in the case.
//
// The harness is optional and opt-in. The deterministic evaluator
// (lib/routing-evaluator.mjs) remains the default for CI.
//
// Run: node scripts/eval-llm-judge.mjs --cases evals/cases/api/http.yml
//      node scripts/eval-llm-judge.mjs --cases evals/cases/api/http.yml --limit 5
//
// The judge LLM is invoked via z-ai-web-dev-sdk. The SDK is dynamically
// imported so the pack stays at zero hard dependencies — the LLM judge
// only runs when z-ai-web-dev-sdk is installed separately.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseRoutingCases,
  validateRoutingCorpus,
  evaluateRoutingCase,
  summarizeRoutingResults,
} from "./routing-evaluator.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Load the skill manifest as a text list of (name, triggers) for the
 * judge LLM's system prompt.
 */
async function loadSkillManifestText() {
  const manifest = await readFile(path.join(ROOT, "skill-manifest.yml"), "utf8");
  const skills = [...manifest.matchAll(/^  - name: ([a-z0-9-]+)$\n^    category: (.+)$\n^    triggers: \[(.*)\]$/gm)]
    .map((m) => ({
      name: m[1],
      category: m[2],
      triggers: m[3],
    }));
  return skills;
}

/**
 * Build the system prompt for the judge LLM. Lists every registered
 * skill with its triggers so the LLM can pick the right primary.
 */
function buildSystemPrompt(skills) {
  const skillLines = skills
    .map((s) => `- ${s.name} (category: ${s.category}; triggers: ${s.triggers})`)
    .join("\n");
  return `You are a routing judge for the node-agent-skills pack.

Given a backend engineering task prompt, pick the SINGLE primary skill from the registered skill list that should own the work. Also pick 0-5 secondary skills that should be loaded alongside the primary.

Respond with JSON only. No prose. No markdown fences. The schema:

{
  "case": "<case-name-from-the-prompt>",
  "primary": "<skill-name>",
  "secondary": ["<skill-name>", ...],
  "adapter": "<adapter-path-or-null>",
  "reasoning": "<one-sentence justification>"
}

Registered skills (name, category, triggers):

${skillLines}

Rules:
- primary MUST be one of the registered skill names above. Do not invent.
- secondary items MUST also be from the list. Do not include the primary in secondary.
- If the prompt mentions a specific framework or library, set adapter to "adapters/<name>/SKILL.md" only if that adapter is registered. Otherwise null.
- Keep reasoning to one sentence. The point is the decision, not the explanation.`;
}

/**
 * Parse the judge LLM's response into a routing decision object.
 * Tolerates markdown fences and extra prose; extracts the first JSON object.
 */
function parseJudgeResponse(text, caseName) {
  // Strip markdown fences if present.
  const cleaned = text.replace(/```(?:json)?/g, "").trim();
  // Find the first { ... } block.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return { case: caseName, primary: "", secondary: [], adapter: null, reasoning: "PARSE_FAILED", raw: text };
  }
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return {
      case: parsed.case ?? caseName,
      primary: parsed.primary ?? "",
      secondary: Array.isArray(parsed.secondary) ? parsed.secondary : [],
      adapter: parsed.adapter && parsed.adapter !== "null" ? parsed.adapter : null,
      reasoning: parsed.reasoning ?? "",
    };
  } catch {
    return { case: caseName, primary: "", secondary: [], adapter: null, reasoning: "JSON_PARSE_FAILED", raw: text };
  }
}

/**
 * Run the LLM judge against a single eval case.
 *
 * @param {object} caseDefinition  one entry from parseRoutingCases()
 * @param {object} zai            the z-ai-web-dev-sdk client
 * @param {string} systemPrompt    the judge system prompt
 * @returns {Promise<object>}     a routing decision
 */
export async function judgeSingleCase(caseDefinition, zai, systemPrompt) {
  const userMessage = `Case: ${caseDefinition.name}

Prompt: ${caseDefinition.prompt}

Return JSON per the schema.`;

  let response;
  try {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });
    response = completion?.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    return {
      case: caseDefinition.name,
      primary: "",
      secondary: [],
      adapter: null,
      reasoning: `LLM_CALL_FAILED: ${err?.message ?? err}`,
    };
  }
  return parseJudgeResponse(response, caseDefinition.name);
}

/**
 * Run the LLM judge across a corpus of eval cases. Returns a summary
 * report compatible with summarizeRoutingResults().
 *
 * @param {Array} cases            output of parseRoutingCases()
 * @param {object} zai             z-ai-web-dev-sdk client
 * @param {object} options         { limit, concurrency }
 * @returns {Promise<object>}      summary report
 */
export async function judgeCorpus(cases, zai, options = {}) {
  const { limit, concurrency = 1 } = options;
  const skills = await loadSkillManifestText();
  const systemPrompt = buildSystemPrompt(skills);

  const selected = limit ? cases.slice(0, limit) : cases;
  const registeredSkills = new Set(skills.map((s) => s.name));

  // Collect decisions.
  const decisions = [];
  // Simple concurrency: bound in-flight via a semaphore.
  let inFlight = 0;
  let next = 0;
  const results = new Array(selected.length);
  async function worker() {
    while (next < selected.length) {
      const i = next++;
      const decision = await judgeSingleCase(selected[i], zai, systemPrompt);
      results[i] = evaluateRoutingCase(selected[i], decision, registeredSkills);
    }
  }
  const workers = [];
  for (let i = 0; i < concurrency; i += 1) workers.push(worker());
  await Promise.all(workers);

  return summarizeRoutingResults(results);
}

export { loadSkillManifestText, buildSystemPrompt, parseJudgeResponse };
