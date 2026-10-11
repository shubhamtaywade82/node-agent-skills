import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Skill loader: parses skill-manifest.yml, matches a prompt against skill
 * triggers/categories, detects adapters from a target repository's
 * package.json, and returns the ordered set of SKILL.md paths an agent
 * should load.
 *
 * Zero-dependency, ESM, Node >= 24.
 */

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const CASE_HEADER = /^  - name: ([a-z0-9-]+)$/;
const TRIGGERS = /^    triggers: \[(.*)\]$/;
const CATEGORY = /^    category: (.+)$/;
const ADAPTER_PATH = /^    path: (adapters\/.+)$/;
const ADAPTER_SOURCE = /^    source: (.+)$/;
const ADAPTER_SCOPE = /^    version_scope: (.+)$/;

/**
 * Parse skill-manifest.yml into structured skill and adapter registries.
 * The manifest format is intentionally narrow (see scripts/validate.mjs),
 * so a line-based parser is sufficient and avoids a YAML dependency.
 *
 * @returns {Promise<{skills: SkillEntry[], adapters: AdapterEntry[]}>}
 */
export async function parseManifest() {
  const manifestPath = path.join(ROOT, "skill-manifest.yml");
  const text = await readFile(manifestPath, "utf8");
  const lines = text.split("\n");

  const skills = [];
  const adapters = [];
  let i = 0;

  while (i < lines.length) {
    const skillMatch = lines[i].match(CASE_HEADER);
    if (skillMatch) {
      const entry = { name: skillMatch[1], category: "", triggers: [] };
      // Walk forward through the skill block until the next top-level entry.
      for (let j = i + 1; j < lines.length; j += 1) {
        const line = lines[j];
        if (CASE_HEADER.test(line) || /^  [a-z0-9-]+:$/.test(line)) break;
        const cat = line.match(CATEGORY);
        if (cat) entry.category = cat[1].trim();
        const trg = line.match(TRIGGERS);
        if (trg) {
          entry.triggers = trg[1]
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      skills.push(entry);
      i += 1;
      continue;
    }

    const adapterMatch = lines[i].match(/^  ([a-z0-9-]+):$/);
    if (adapterMatch) {
      const name = adapterMatch[1];
      const pathLine = lines[i + 1] ?? "";
      const scopeLine = lines[i + 2] ?? "";
      const sourceLine = lines[i + 3] ?? "";
      if (pathLine.startsWith("    path: adapters/")) {
        adapters.push({
          name,
          path: pathLine.slice("    path: ".length).trim(),
          version_scope: scopeLine.slice("    version_scope: ".length).trim(),
          source: sourceLine.slice("    source: ".length).trim(),
          // Adapter detection tokens derived from the adapter directory name
          // (e.g. "express" -> "express"). Keeps detection zero-config.
          package: name,
        });
      }
    }
    i += 1;
  }

  return { skills, adapters };
}

/**
 * Tokenize a prompt into normalized lowercase terms for trigger matching.
 * Lower-cases, strips punctuation, splits on whitespace, dedupes.
 *
 * @param {string} prompt
 * @returns {string[]}
 */
function tokenizePrompt(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) return [];
  const seen = new Set();
  const tokens = [];
  for (const raw of prompt.toLowerCase().split(/[^a-z0-9-]+/i)) {
    if (!raw) continue;
    if (seen.has(raw)) continue;
    seen.add(raw);
    tokens.push(raw);
  }
  return tokens;
}

/**
 * Score a skill against a prompt's token set. Each trigger term that appears
 * as a substring of any prompt token contributes 1 point. Multiword triggers
 * (e.g. "connection pool") score 2 to reward specificity.
 *
 * @param {SkillEntry} skill
 * @param {string[]} tokens
 * @returns {number}
 */
function scoreSkill(skill, tokens) {
  if (!tokens.length) return 0;
  const promptText = " " + tokens.join(" ") + " ";
  let score = 0;
  for (const trigger of skill.triggers) {
    const t = trigger.toLowerCase();
    if (promptText.includes(" " + t + " ") || promptText.includes(" " + t + ",")) {
      score += t.includes(" ") ? 2 : 1;
    } else if (promptText.includes(t)) {
      score += 0.5;
    }
  }
  return score;
}

/**
 * Detect adapters present in a target repository's package.json.
 * Reads dependencies, devDependencies, and optionalDependencies keys.
 *
 * @param {string} repoPath absolute path to target repository
 * @param {AdapterEntry[]} adapters
 * @returns {Promise<DetectedAdapter[]>}
 */
export async function detectAdapters(repoPath, adapters) {
  if (!repoPath) return [];
  const pkgPath = path.join(repoPath, "package.json");
  let pkg;
  try {
    pkg = JSON.parse(await readFile(pkgPath, "utf8"));
  } catch {
    return [];
  }
  const deps = new Map([
    ...Object.entries(pkg.dependencies ?? {}),
    ...Object.entries(pkg.devDependencies ?? {}),
    ...Object.entries(pkg.optionalDependencies ?? {}),
    ...Object.entries(pkg.peerDependencies ?? {}),
  ]);

  const detected = [];
  for (const adapter of adapters) {
    const version = deps.get(adapter.package);
    if (typeof version === "string" && version.length > 0) {
      detected.push({
        name: adapter.name,
        path: adapter.path,
        version_scope: adapter.version_scope,
        source: adapter.source,
        installed_version: version.replace(/^[^0-9]/, ""),
      });
    }
  }
  return detected;
}

/**
 * Resolve secondary skills for a primary skill by consulting the routing
 * table in router/ROUTING_CASES.yml. Returns [] if the primary has no case.
 *
 * @param {string} primarySkill
 * @returns {Promise<string[]>}
 */
export async function resolveSecondaries(primarySkill) {
  const casesPath = path.join(ROOT, "router", "ROUTING_CASES.yml");
  let text;
  try {
    text = await readFile(casesPath, "utf8");
  } catch {
    return [];
  }
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^  - name: ([a-z0-9-]+)$/);
    if (!m) continue;
    if (lines[i + 1]?.match(new RegExp(`^    primary: ${primarySkill}$`))) {
      const secLine = lines[i + 2] ?? "";
      const secMatch = secLine.match(/^    secondary: \[(.*)\]$/);
      if (!secMatch) return [];
      return secMatch[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

/**
 * Load and return the text of a skill file by name.
 *
 * @param {string} skillName e.g. "node-postgresql-persistence"
 * @returns {Promise<string|null>}
 */
export async function loadSkillText(skillName) {
  const file = path.join(ROOT, "skills", skillName, "SKILL.md");
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

/**
 * Route a prompt to a primary skill, optional secondaries, and detected
 * adapters. The main entry point for an agent runtime.
 *
 * @param {string} prompt
 * @param {string} [repoPath] absolute path to target repo for adapter detection
 * @param {{limit?: number, minScore?: number}} [options]
 * @returns {Promise<RoutingResult>}
 */
export async function routePrompt(prompt, repoPath, options = {}) {
  const { limit = 5, minScore = 1 } = options;
  const { skills, adapters } = await parseManifest();
  const tokens = tokenizePrompt(prompt);

  const scored = skills
    .map((skill) => ({ skill, score: scoreSkill(skill, tokens) }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));

  const top = scored.slice(0, limit).map((entry) => entry.skill.name);
  const primary = top[0] ?? null;
  const secondaries = primary ? await resolveSecondaries(primary) : [];
  const detectedAdapters = await detectAdapters(repoPath, adapters);

  return {
    prompt,
    tokens,
    primary,
    secondary: secondaries,
    candidates: top,
    adapters: detectedAdapters,
    skills_root: path.join(ROOT, "skills"),
    adapters_root: path.join(ROOT, "adapters"),
  };
}

/**
 * List all registered skills, optionally filtered by category.
 *
 * @param {string} [category]
 * @returns {Promise<SkillEntry[]>}
 */
export async function listSkills(category) {
  const { skills } = await parseManifest();
  if (!category) return skills;
  return skills.filter((s) => s.category === category);
}

/**
 * List all registered adapters.
 *
 * @returns {Promise<AdapterEntry[]>}
 */
export async function listAdapters() {
  const { adapters } = await parseManifest();
  return adapters;
}
