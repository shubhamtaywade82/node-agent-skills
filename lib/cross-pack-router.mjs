/**
 * Cross-pack skill router.
 *
 * Routes a prompt across multiple skill packs (this pack plus any installed
 * companions), applying the v3 language-aware scoring from
 * docs/CROSS_PACK_SCHEMA.md:
 *
 *   1. Language tag wins: skills whose (per-skill or inherited pack) language
 *      matches the active file's language are boosted (x2) and non-matching
 *      skills are demoted (x0.5).
 *   2. Seam skills win on cross-stack tasks: when the overall primary is a
 *      seam skill with a declared seam_contract, the router returns the
 *      companion side to load with it.
 *   3. Companion ownership is surfaced: the primary skill's companion_owners
 *      (when declared) are returned so the agent can load companion skills
 *      as secondary references.
 *
 * Pack discovery order:
 *   - options.packs (array of pack roots; entries may be comma-separated)
 *   - AGENT_SKILLS_PACKS env var (comma- or colon-separated roots)
 *   - sibling directories of this pack's root, named after each declared
 *     cross_pack.companions[].pack (e.g. ../ruby-agent-skills)
 *   - this pack's root, always
 *
 * Every discovered root must contain a skill-manifest.yml. Both manifest
 * entry shapes (mapping form and sequence form) are supported via
 * lib/cross-pack-manifest.mjs.
 *
 * Zero-dependency, ESM, Node >= 24.
 */

import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseSkillEntries,
  parsePackEnvelope,
  parseCrossPackSection,
  languageFor,
  languageAdjustedScore,
  tokenizePrompt,
  scoreTriggers,
} from "./cross-pack-manifest.mjs";

const ROOT = process.env.NODE_AGENT_SKILLS_ROOT
  ? path.resolve(process.env.NODE_AGENT_SKILLS_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Discover pack roots to route across: this pack plus companions.
 * @param {string[]|undefined} explicitPacks
 * @returns {string[]}
 */
export function discoverPackRoots(explicitPacks) {
  const roots = [];

  const pushRoots = (value) => {
    for (const entry of Array.isArray(value) ? value : [value]) {
      for (const candidate of String(entry ?? "").split(/[,:]/)) {
        const trimmed = candidate.trim();
        if (trimmed) roots.push(path.resolve(trimmed));
      }
    }
  };

  pushRoots(explicitPacks);
  pushRoots(process.env.AGENT_SKILLS_PACKS ?? []);

  // Sibling-directory discovery from the declared companions.
  const crossPackManifest = readCrossPack(ROOT);
  for (const companion of crossPackManifest?.companions ?? []) {
    const sibling = path.resolve(ROOT, "..", companion.pack);
    roots.push(sibling);
  }

  roots.push(ROOT);

  const unique = [...new Set(roots)];
  return unique.filter((root) => existsSync(path.join(root, "skill-manifest.yml")));
}

function readCrossPack(packRoot) {
  const manifestPath = path.join(packRoot, "skill-manifest.yml");
  if (!existsSync(manifestPath)) return null;
  try {
    const text = readFileSync(manifestPath, "utf8");
    return parseCrossPackSection(text);
  } catch {
    return null;
  }
}

/**
 * Route one pack's skills against the prompt.
 * @param {string} packRoot
 * @param {string} prompt
 * @param {string|null} activeLanguage
 */
async function routePack(packRoot, prompt, activeLanguage) {
  const manifestPath = path.join(packRoot, "skill-manifest.yml");
  const text = await readFile(manifestPath, "utf8");
  const { pack, schema_version } = parsePackEnvelope(text);
  const skills = parseSkillEntries(text);
  const packLanguage = pack.language ?? null;
  const tokens = tokenizePrompt(prompt);

  const scored = skills
    .map((skill) => {
      const base = scoreTriggers(skill.triggers, tokens);
      const skillLanguage = skill.language ?? packLanguage;
      const score = languageAdjustedScore(base, activeLanguage, skillLanguage);
      return {
        name: skill.name,
        score: round(score),
        base_score: round(base),
        language: skillLanguage,
        family: skill.family ?? null,
        category: skill.category ?? null,
        path: skill.path ?? `skills/${skill.name}/SKILL.md`,
        companion_owners: skill.companion_owners ?? [],
      };
    })
    .filter((candidate) => candidate.score >= 1)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    root: packRoot,
    pack: {
      name: pack.name ?? path.basename(packRoot),
      language: packLanguage,
      runtime: pack.runtime ?? null,
      schema_version,
    },
    primary: scored[0]?.name ?? null,
    candidates: scored.slice(0, 5),
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Recommend the seam contract when the routing result points at a seam skill
 * or spans multiple packs. The contract is looked up in the pack that OWNS
 * the seam skill (either side of a symmetric seam declares its own contract).
 */
function recommendSeam(packResults, overall) {
  const seamSkill = overall.find((candidate) => /-integration$/.test(candidate.name));
  const multiPack = packResults.filter((result) => result.primary).length > 1;

  if (seamSkill) {
    const ownerCrossPack = readCrossPack(seamSkill.pack_root);
    const contract = (ownerCrossPack?.seam_contracts ?? []).find(
      (entry) => entry.primary_in_this_pack === seamSkill.name
    );
    if (contract) {
      return {
        recommended: true,
        boundary: contract.boundary,
        this_pack_seam: contract.primary_in_this_pack,
        companion_pack: contract.companion_pack,
        companion_side: contract.companion_side,
        reason: "task routes to a cross-pack seam skill; load the companion side with it",
      };
    }
    return {
      recommended: true,
      skill: seamSkill.name,
      reason: "task routes to an integration seam skill",
    };
  }

  if (multiPack) {
    return {
      recommended: true,
      reason: "top candidates span multiple packs; consult router/ROUTING.md cross-stack sections",
    };
  }

  return { recommended: false, reason: "single-pack task" };
}

/**
 * Route a prompt across this pack and any installed companion packs.
 *
 * @param {string} prompt
 * @param {{packs?: string[], file?: string, language?: string, limit?: number}} [options]
 * @returns {Promise<object>}
 */
export async function routeCrossPack(prompt, options = {}) {
  const { packs, file, language } = options;
  const activeLanguage = language ?? languageFor(file);
  const packRoots = discoverPackRoots(packs);

  const packResults = [];
  for (const packRoot of packRoots) {
    try {
      packResults.push(await routePack(packRoot, prompt, activeLanguage));
    } catch {
      // Skip packs that cannot be read (missing manifest, permissions).
    }
  }

  const overall = packResults
    .flatMap((result) =>
      result.candidates.map((candidate) => ({
        ...candidate,
        pack: result.pack.name,
        pack_root: result.root,
      }))
    )
    .sort((a, b) =>
      b.score - a.score ||
      a.pack.localeCompare(b.pack) ||
      a.name.localeCompare(b.name)
    );

  const primary = overall[0]
    ? {
        pack: overall[0].pack,
        name: overall[0].name,
        score: overall[0].score,
        language: overall[0].language,
        path: overall[0].path,
      }
    : null;

  return {
    prompt,
    active_language: activeLanguage,
    packs_consulted: packResults.map((result) => result.pack.name),
    packs: packResults,
    primary,
    candidates: overall.slice(0, 8).map((candidate) => ({
      pack: candidate.pack,
      name: candidate.name,
      score: candidate.score,
      language: candidate.language,
    })),
    seam: recommendSeam(packResults, overall),
    companion_owners: primary ? (overall[0].companion_owners ?? []) : [],
  };
}
