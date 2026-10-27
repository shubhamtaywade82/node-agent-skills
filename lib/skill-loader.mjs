import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parsePackEnvelope,
  parseCrossPackSection,
  languageFor,
  languageAdjustedScore,
} from "./cross-pack-manifest.mjs";

/**
 * Skill loader: parses skill-manifest.yml, matches a prompt against skill
 * triggers/categories, detects adapters from a target repository's
 * package.json, and returns the ordered set of SKILL.md paths an agent
 * should load.
 *
 * Zero-dependency, ESM, Node >= 24.
 *
 * v3 additions (additive, defaults preserved):
 *   - The ROOT is overridable via NODE_AGENT_SKILLS_ROOT env var. When
 *     unset, falls back to the script-relative `..` (legacy v1 behavior).
 *     This lets an MCP server / CLI be installed away from the pack
 *     checkout and pointed at a pinned pack location.
 *   - The skill block parser now reads optional v3 fields if present:
 *       path: (overrides the derived skills/<name>/SKILL.md)
 *       family: (mirrors ruby-agent-skills's `family` field)
 *       language: (per-skill language tag, defaults to pack.language)
 *       version: (semver, was decorative in v1; meaningful in v3)
 *       compatibility: (mirrors ruby's optional field)
 *       schema_version: (per-skill v3 marker)
 *     When absent, the loader's behavior is identical to v1.
 *   - All existing exports (parseManifest, detectAdapters, resolveSecondaries,
 *     loadSkillText, routePrompt, listSkills, listAdapters) keep the same
 *     signatures and defaults.
 */

const ROOT = process.env.NODE_AGENT_SKILLS_ROOT
  ? path.resolve(process.env.NODE_AGENT_SKILLS_ROOT)
  : path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
    );

const CASE_HEADER = /^  - name: ([a-z0-9-]+)$/;
const TRIGGERS = /^    triggers: \[(.*)\]$/;
const CATEGORY = /^    category: (.+)$/;
const SKILL_PATH = /^    path: (skills\/.+)$/;          // v3: per-skill path override
const SKILL_FAMILY = /^    family: (.+)$/;             // v3: per-skill family
const SKILL_LANGUAGE = /^    language: (.+)$/;          // v3: per-skill language
const SKILL_VERSION = /^    version: (.+)$/;            // v1 (decorative) + v3 (meaningful)
const SKILL_COMPAT = /^    compatibility: (.*)$/;       // v3: per-skill compatibility
const SKILL_SCHEMA_VER = /^    schema_version: (.+)$/;  // v3: per-skill v3 marker
const SKILL_COMPANION_OWNERS_LINE = /^    companion_owners:$/;  // v3: list block start
const ADAPTER_PATH = /^    path: (adapters\/.+)$/;
const ADAPTER_SOURCE = /^    source: (.+)$/;
const ADAPTER_SCOPE = /^    version_scope: (.+)$/;

/**
 * Parse skill-manifest.yml into structured skill and adapter registries.
 * The manifest format is intentionally narrow (see scripts/validate.mjs),
 * so a line-based parser is sufficient and avoids a YAML dependency.
 *
 * v3 (additive): the returned object also carries the pack envelope
 * (`pack`), the manifest `schema_version`, and the parsed `cross_pack`
 * section; skill entries now include optional v3 fields (`path`, `family`,
 * `language`, `version`, `schema_version`, `compatibility`,
 * `companion_owners`) when present in the manifest. Consumers that only
 * destructure `{ skills, adapters }` see no change.
 *
 * @returns {Promise<{skills: SkillEntry[], adapters: AdapterEntry[], pack: object, schema_version: number|null, cross_pack: object|null}>}
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
      let inCompanionOwners = false;
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
          inCompanionOwners = false;
          continue;
        }
        // ---- v3 additive fields (present only on v3-aware entries) ----
        if (SKILL_COMPANION_OWNERS_LINE.test(line)) {
          entry.companion_owners = [];
          inCompanionOwners = true;
          continue;
        }
        if (inCompanionOwners) {
          const ownerItem = line.match(/^      - (.+)$/);
          if (ownerItem) {
            entry.companion_owners.push(ownerItem[1].trim());
            continue;
          }
          inCompanionOwners = false;
        }
        const skillPath = line.match(SKILL_PATH);
        if (skillPath) entry.path = skillPath[1].trim();
        const family = line.match(SKILL_FAMILY);
        if (family) entry.family = family[1].trim();
        const language = line.match(SKILL_LANGUAGE);
        if (language) entry.language = language[1].trim();
        const version = line.match(SKILL_VERSION);
        if (version) entry.version = version[1].trim();
        const schemaVersion = line.match(SKILL_SCHEMA_VER);
        if (schemaVersion) entry.schema_version = parseInt(schemaVersion[1], 10);
        const compatibility = line.match(SKILL_COMPAT);
        if (compatibility) entry.compatibility = compatibility[1].trim();
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

  const { pack, schema_version } = parsePackEnvelope(text);
  const cross_pack = parseCrossPackSection(text);
  return { skills, adapters, pack, schema_version, cross_pack };
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
 * Load and return the text of a skill file by name. Tries the derived
 * `skills/<name>/SKILL.md` path first (the common case); falls back to the
 * manifest's per-skill v3 `path` override when present.
 *
 * @param {string} skillName e.g. "node-postgresql-persistence"
 * @returns {Promise<string|null>}
 */
export async function loadSkillText(skillName) {
  const file = path.join(ROOT, "skills", skillName, "SKILL.md");
  try {
    return await readFile(file, "utf8");
  } catch {
    // fall through to the manifest path override
  }
  const { skills } = await parseManifest();
  const entry = skills.find((skill) => skill.name === skillName);
  if (entry?.path) {
    try {
      return await readFile(path.join(ROOT, entry.path), "utf8");
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Route a prompt to a primary skill, optional secondaries, and detected
 * adapters. The main entry point for an agent runtime.
 *
 * v3 (additive): `options.activeFile` (a file path) or `options.language`
 * enables language-aware scoring — skills whose language matches the active
 * file's language are boosted (x2) and non-matching skills are demoted (x0.5),
 * per docs/CROSS_PACK_SCHEMA.md. Skills without a per-skill `language` inherit
 * the pack envelope's language. The result gains an `active_language` key;
 * every other key is unchanged.
 *
 * @param {string} prompt
 * @param {string} [repoPath] absolute path to target repo for adapter detection
 * @param {{limit?: number, minScore?: number, activeFile?: string, language?: string}} [options]
 * @returns {Promise<RoutingResult>}
 */
export async function routePrompt(prompt, repoPath, options = {}) {
  const { limit = 5, minScore = 1, activeFile, language } = options;
  const activeLanguage = language ?? languageFor(activeFile);
  const { skills, adapters, pack } = await parseManifest();
  const packLanguage = pack?.language ?? null;
  const tokens = tokenizePrompt(prompt);

  const scored = skills
    .map((skill) => {
      const base = scoreSkill(skill, tokens);
      const skillLanguage = skill.language ?? packLanguage;
      const score = languageAdjustedScore(base, activeLanguage, skillLanguage);
      return { skill, score, base };
    })
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name));

  const top = scored.slice(0, limit).map((entry) => entry.skill.name);
  const primary = top[0] ?? null;
  const secondaries = primary ? await resolveSecondaries(primary) : [];
  const detectedAdapters = await detectAdapters(repoPath, adapters);

  return {
    prompt,
    tokens,
    active_language: activeLanguage,
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
