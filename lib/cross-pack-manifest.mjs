/**
 * Cross-pack manifest parsing and language-aware scoring helpers.
 *
 * Shared by:
 *   - lib/skill-loader.mjs        (pack envelope + cross_pack section on parseManifest)
 *   - lib/cross-pack-router.mjs   (pack-agnostic routing across packs)
 *   - lib/v3-schema.mjs           (structural validation of v3 fields)
 *   - bin/cross-pack-verify.mjs   (companion/snapshot/seam checks)
 *   - bin/skills.mjs              (cross-route CLI)
 *
 * Zero-dependency, ESM, Node >= 24. Line-regex parsing (the pack idiom);
 * every parser is scoped to its manifest section so both entry shapes work:
 *   - mapping form  (ruby-agent-skills):   `  skill-name:` + 4-indent fields
 *   - sequence form (node-agent-skills):   `  - name: skill-name` + 4-indent fields
 *
 * See docs/CROSS_PACK_SCHEMA.md for the v3 contract this module implements.
 */

import path from "node:path";

// ---------------------------------------------------------------------------
// Language maps (mirrored in ruby-agent-skills/lib/ruby_agent_skills/mcp_server.rb)
// ---------------------------------------------------------------------------

export const JS_FAMILY = ["typescript", "javascript"];

export const EXT_LANGUAGE = {
  rb: "ruby", erb: "ruby", gemspec: "ruby", rake: "ruby",
  ts: "typescript", tsx: "typescript", mts: "typescript", cts: "typescript",
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
};

export const FILE_LANGUAGE = {
  Gemfile: "ruby", Rakefile: "ruby", "config.ru": "ruby",
  "package.json": "javascript",
};

/**
 * Resolve the active language from a file path (extension or known filename).
 * @param {string|undefined|null} file
 * @returns {string|null}
 */
export function languageFor(file) {
  if (!file || typeof file !== "string" || !file.trim()) return null;
  const basename = path.basename(file);
  if (Object.prototype.hasOwnProperty.call(FILE_LANGUAGE, basename)) {
    return FILE_LANGUAGE[basename];
  }
  const ext = path.extname(basename).slice(1);
  return EXT_LANGUAGE[ext] ?? null;
}

/**
 * TypeScript and JavaScript match each other (the JS family); everything
 * else must match exactly. Language tags are case-insensitive
 * (`TypeScript` and `typescript` are the same tag).
 */
export function languageMatches(active, skillLanguage) {
  if (!active || !skillLanguage) return false;
  const a = String(active).toLowerCase();
  const s = String(skillLanguage).toLowerCase();
  if (a === s) return true;
  if (JS_FAMILY.includes(a) && JS_FAMILY.includes(s)) return true;
  return false;
}

/**
 * When the active file's language is known, matching skills are boosted (x2)
 * and non-matching skills are demoted (x0.5). Boost-only would leave ties that
 * alphabetical pack order resolves — the exact bias the language field exists
 * to remove.
 */
export function languageAdjustedScore(base, activeLanguage, skillLanguage) {
  if (!activeLanguage) return base;
  return languageMatches(activeLanguage, skillLanguage) ? base * 2 : base * 0.5;
}

// ---------------------------------------------------------------------------
// Prompt tokenization + trigger scoring (behavior-identical to skill-loader.mjs)
// ---------------------------------------------------------------------------

/**
 * Tokenize a prompt into normalized lowercase terms.
 * @param {string} prompt
 * @returns {string[]}
 */
export function tokenizePrompt(prompt) {
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
 * Score trigger terms against a tokenized prompt. Multi-word triggers score 2,
 * single-word 1, substring 0.5 — identical to skill-loader.mjs scoreSkill.
 * @param {string[]} triggers
 * @param {string[]} tokens
 * @returns {number}
 */
export function scoreTriggers(triggers, tokens) {
  if (!tokens.length) return 0;
  const promptText = " " + tokens.join(" ") + " ";
  let score = 0;
  for (const trigger of triggers) {
    const t = trigger.toLowerCase();
    if (promptText.includes(" " + t + " ") || promptText.includes(" " + t + ",")) {
      score += t.includes(" ") ? 2 : 1;
    } else if (promptText.includes(t)) {
      score += 0.5;
    }
  }
  return score;
}

// ---------------------------------------------------------------------------
// Pack-agnostic manifest parsing (scoped to skills:/adapter_skills: sections)
// ---------------------------------------------------------------------------

const ENTRY_MAPPING = /^  ([a-z0-9-]+):$/;
const ENTRY_SEQUENCE = /^  - name: ([a-z0-9-]+)$/;
const FIELD_TRIGGERS = /^    triggers: \[(.*)\]$/;
const FIELD_FAMILY = /^    family: (.+)$/;
const FIELD_CATEGORY = /^    category: (.+)$/;
const FIELD_PATH = /^    path: (skills\/.+)$/;
const FIELD_LANGUAGE = /^    language: (.+)$/;
const FIELD_VERSION = /^    version: (.+)$/;
const FIELD_SCHEMA_VERSION = /^    schema_version: (.+)$/;
const FIELD_COMPATIBILITY = /^    compatibility: (.+)$/;
const FIELD_COMPANION_OWNERS = /^    companion_owners:$/;
const COMPANION_OWNER_ITEM = /^      - (.+)$/;
const TOP_KEY = /^([a-z_][a-z0-9_]*):$/;
const SKILL_SECTIONS = ["skills", "adapter_skills"];

/**
 * Parse the pack envelope (`schema_version`, `pack:`, and the flat legacy
 * `name:`) from a manifest text.
 * @param {string} text
 * @returns {{schema_version: number|null, pack: {name: string|null, language: string|null, runtime: string|null}}}
 */
export function parsePackEnvelope(text) {
  const schemaVersionMatch = text.match(/^schema_version:\s*(\d+)\s*$/m);
  const packName = text.match(/^  name:\s+(.+)$/m);
  const packLanguage = text.match(/^  language:\s+(.+)$/m);
  const packRuntime = text.match(/^  runtime:\s+(.+)$/m);
  const flatName = text.match(/^name:\s+(.+)$/m);
  return {
    schema_version: schemaVersionMatch ? parseInt(schemaVersionMatch[1], 10) : null,
    pack: {
      name: packName ? packName[1].trim() : flatName ? flatName[1].trim() : null,
      language: packLanguage ? packLanguage[1].trim() : null,
      runtime: packRuntime ? packRuntime[1].trim() : null,
    },
  };
}

/**
 * Parse every skill entry from the `skills:` (and `adapter_skills:`) sections
 * of a manifest, supporting both mapping and sequence entry forms. Skill
 * entries are scoped to their section; `patterns:`, `deprecations:`,
 * `benchmarks:`, and other sections with 2-indent keys are ignored.
 *
 * @param {string} text manifest text
 * @returns {{name: string, triggers: string[], family?: string, category?: string,
 *            path?: string, language?: string, version?: string,
 *            schema_version?: number, compatibility?: string,
 *            companion_owners?: string[], section: string}[]}
 */
export function parseSkillEntries(text) {
  const lines = text.split("\n");
  const skills = [];
  let section = null;
  let current = null;
  let inCompanionOwners = false;

  for (const line of lines) {
    const top = line.match(TOP_KEY);
    if (top) {
      section = SKILL_SECTIONS.includes(top[1]) ? top[1] : null;
      current = null;
      inCompanionOwners = false;
      continue;
    }
    if (!section) continue;

    const mappingEntry = line.match(ENTRY_MAPPING);
    if (mappingEntry) {
      current = { name: mappingEntry[1], triggers: [], section };
      skills.push(current);
      inCompanionOwners = false;
      continue;
    }
    const sequenceEntry = line.match(ENTRY_SEQUENCE);
    if (sequenceEntry) {
      current = { name: sequenceEntry[1], triggers: [], section };
      skills.push(current);
      inCompanionOwners = false;
      continue;
    }
    if (!current) continue;

    if (FIELD_COMPANION_OWNERS.test(line)) {
      current.companion_owners = [];
      inCompanionOwners = true;
      continue;
    }
    if (inCompanionOwners) {
      const item = line.match(COMPANION_OWNER_ITEM);
      if (item) {
        current.companion_owners.push(item[1].trim());
        continue;
      }
      inCompanionOwners = false;
    }

    const triggers = line.match(FIELD_TRIGGERS);
    if (triggers) {
      current.triggers = triggers[1].split(",").map((s) => s.trim()).filter(Boolean);
      continue;
    }
    const family = line.match(FIELD_FAMILY);
    if (family) { current.family = family[1].trim(); continue; }
    const category = line.match(FIELD_CATEGORY);
    if (category) { current.category = category[1].trim(); continue; }
    const p = line.match(FIELD_PATH);
    if (p) { current.path = p[1].trim(); continue; }
    const language = line.match(FIELD_LANGUAGE);
    if (language) { current.language = language[1].trim(); continue; }
    const version = line.match(FIELD_VERSION);
    if (version) { current.version = version[1].trim(); continue; }
    const schemaVersion = line.match(FIELD_SCHEMA_VERSION);
    if (schemaVersion) { current.schema_version = parseInt(schemaVersion[1], 10); continue; }
    const compatibility = line.match(FIELD_COMPATIBILITY);
    if (compatibility) { current.compatibility = compatibility[1].trim(); continue; }
  }

  return skills;
}

// ---------------------------------------------------------------------------
// cross_pack: section parsing
// ---------------------------------------------------------------------------

const COMPANION_ENTRY = /^    - pack: (.+)$/;
const COMPANION_FIELD = /^      (\w+): (.*)$/;
const SEAM_ENTRY = /^    - boundary: (.+)$/;
const SEAM_FIELD = /^      (\w+): (.*)$/;
const SEAM_LIST_START = /^      (\w+):$/;
const SEAM_LIST_ITEM = /^        - (.+)$/;
const NAME_COLLISION_ENTRY = /^    - skill_name: (.+)$/;

/**
 * Parse the top-level `cross_pack:` section of a manifest.
 * Handles companions, name_collisions (both bare and mapping forms), and
 * seam_contracts (with nested secondary lists).
 *
 * @param {string} text
 * @returns {{schema_version: number|null, companions: object[], name_collisions: object[], seam_contracts: object[]}|null}
 */
export function parseCrossPackSection(text) {
  const lines = text.split("\n");
  const sectionStart = lines.findIndex((line) => /^cross_pack:$/.test(line));
  if (sectionStart === -1) return null;

  const section = { schema_version: null, companions: [], name_collisions: [], seam_contracts: [] };
  let mode = null; // "companion" | "seam" | "name_collision" | null
  let currentEntry = null;
  let listField = null;

  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^[a-z_]+:$/.test(line)) break; // next top-level key ends the section

    const topField = line.match(/^  (\w+): (.+)$/);
    if (topField) {
      mode = null; currentEntry = null; listField = null;
      if (topField[1] === "schema_version") section.schema_version = parseInt(topField[2], 10);
      continue;
    }

    const topListStart = line.match(/^  (\w+):$/);
    if (topListStart) {
      mode = topListStart[1] === "name_collisions" ? "name_collision" : null;
      currentEntry = null; listField = null;
      continue;
    }

    const companionMatch = line.match(COMPANION_ENTRY);
    if (companionMatch) {
      mode = "companion";
      currentEntry = { pack: companionMatch[1].trim() };
      section.companions.push(currentEntry);
      continue;
    }

    const seamMatch = line.match(SEAM_ENTRY);
    if (seamMatch) {
      mode = "seam";
      currentEntry = { boundary: seamMatch[1].trim() };
      section.seam_contracts.push(currentEntry);
      continue;
    }

    const collisionMatch = line.match(NAME_COLLISION_ENTRY);
    if (collisionMatch) {
      mode = "name_collision";
      currentEntry = { skill_name: collisionMatch[1].trim() };
      section.name_collisions.push(currentEntry);
      continue;
    }

    const fieldMatch = line.match(mode === "name_collision" ? /^      (\w+): (.*)$/ : COMPANION_FIELD);
    if (fieldMatch && currentEntry) {
      currentEntry[fieldMatch[1]] = fieldMatch[2].trim();
      listField = null;
      continue;
    }

    const listStartMatch = line.match(SEAM_LIST_START);
    if (listStartMatch && currentEntry) {
      currentEntry[listStartMatch[1]] = [];
      listField = listStartMatch[1];
      continue;
    }

    const listItemMatch = line.match(SEAM_LIST_ITEM);
    if (listItemMatch && currentEntry && listField) {
      currentEntry[listField].push(listItemMatch[1].trim());
      continue;
    }
  }

  return section;
}

// ---------------------------------------------------------------------------
// Companion snapshot parsing
// ---------------------------------------------------------------------------

/**
 * Parse a companion snapshot file (data/cross-pack/<pack>.snapshot.yml).
 * Handles both bare-name and skill_name mapping collision entries.
 * @param {string} text
 */
export function parseSnapshot(text) {
  const skills = [];
  const collisions = [];
  let capturedAt = null;
  let companionCommit = null;
  let mode = null; // "skills" | "collisions" | null

  const lines = text.split("\n");
  for (const line of lines) {
    const capturedMatch = line.match(/^captured_at:\s+"?([^"\n]+)"?\s*$/);
    if (capturedMatch) { capturedAt = capturedMatch[1].trim(); continue; }
    const commitMatch = line.match(/^companion_commit:\s+"?([^"\n]+)"?\s*$/);
    if (commitMatch) { companionCommit = commitMatch[1].trim(); continue; }
    if (/^skills:$/.test(line)) { mode = "skills"; continue; }
    if (/^documented_name_collisions:/.test(line)) {
      const inlineMatch = line.match(/^documented_name_collisions:\s*\[(.*)\]\s*$/);
      if (inlineMatch && inlineMatch[1].trim()) {
        for (const item of inlineMatch[1].split(",")) {
          if (item.trim()) collisions.push(item.trim().replace(/^["']|["']$/g, ""));
        }
      }
      mode = "collisions";
      continue;
    }
    const itemMatch = line.match(/^  - (.+)$/);
    if (itemMatch && mode === "skills") {
      skills.push(itemMatch[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    if (mode === "collisions") {
      const bareMatch = line.match(/^  - ([a-z0-9-]+)\s*$/);
      if (bareMatch) { collisions.push(bareMatch[1].trim()); continue; }
      const mapMatch = line.match(/^  - skill_name: (.+)$/);
      if (mapMatch) { collisions.push(mapMatch[1].trim().replace(/^["']|["']$/g, "")); continue; }
      const fieldMatch = line.match(/^    skill_name: (.+)$/);
      if (fieldMatch) { collisions.push(fieldMatch[1].trim().replace(/^["']|["']$/g, "")); continue; }
    }
  }
  return { skills, documented_name_collisions: collisions, captured_at: capturedAt, companion_commit: companionCommit };
}
