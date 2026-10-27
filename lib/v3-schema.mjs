/**
 * Zero-dependency structural validator for cross-pack manifest schema v3.
 *
 * Validates the shapes documented in docs/CROSS_PACK_SCHEMA.md using the
 * same line-regex parsers as the loader (lib/cross-pack-manifest.mjs):
 *   - top-level `schema_version` (must be 3 when declared)
 *   - `pack:` envelope (name/language/runtime non-empty when v3)
 *   - per-skill v3 fields (path format, language enum, semver version,
 *     int schema_version, companion_owners pack/skill form)
 *   - `cross_pack:` section (companions, name_collisions, seam_contracts)
 *   - `adapters:` mapping (path/version_scope/source)
 *
 * Used by bin/cross-pack-verify.mjs (deep checks) and importable directly:
 *
 *   import { validateManifestV3 } from "./v3-schema.mjs";
 *   const { errors, warnings } = validateManifestV3(text);
 */

import {
  parsePackEnvelope,
  parseSkillEntries,
  parseCrossPackSection,
} from "./cross-pack-manifest.mjs";

const KNOWN_LANGUAGES = [
  "ruby", "typescript", "javascript", "python", "go", "rust", "java", "multi",
];
const COLLISION_RESOLUTIONS = [
  "this_pack_wins", "companion_wins", "context_dependent", "split_by_language",
];
const SEMVER = /^\d+\.\d+\.\d+(?:[-+][0-9a-zA-Z.-]+)?$/;
const SKILL_PATH = /^skills\/[a-z0-9-]+\/SKILL\.md$/;
const ADAPTER_PATH = /^adapters\/[a-z0-9-]+\/SKILL\.md$/;
const COMPANION_OWNER = /^[a-z0-9-]+\/[a-z0-9-]+$/;

/**
 * Validate a manifest text against the v3 schema. Returns errors (must fix)
 * and warnings (should review). A manifest without `schema_version: 3` is
 * reported as an error by design — this validator is only for v3-aware packs.
 *
 * @param {string} text manifest text
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateManifestV3(text) {
  const errors = [];
  const warnings = [];

  // ---- top-level markers -------------------------------------------------
  const { pack, schema_version } = parsePackEnvelope(text);
  if (schema_version === null) {
    errors.push("schema_version missing — manifest is not v3-aware (add `schema_version: 3` at the top)");
  } else if (schema_version !== 3) {
    errors.push(`schema_version is ${schema_version}, expected 3`);
  }

  // ---- pack envelope -----------------------------------------------------
  if (!pack.name) errors.push("pack.name missing");
  if (!pack.language) errors.push("pack.language missing");
  if (!pack.runtime) errors.push("pack.runtime missing");
  if (pack.language && !KNOWN_LANGUAGES.includes(pack.language.toLowerCase())) {
    warnings.push(`pack.language "${pack.language}" is not in the known set ${KNOWN_LANGUAGES.join(", ")}`);
  }

  // ---- per-skill v3 fields -----------------------------------------------
  const skills = parseSkillEntries(text);
  if (skills.length === 0) errors.push("no skill entries found under skills:/adapter_skills:");

  const seen = new Set();
  for (const skill of skills) {
    if (seen.has(skill.name)) errors.push(`duplicate skill name: ${skill.name}`);
    seen.add(skill.name);

    if (!Array.isArray(skill.triggers) || skill.triggers.length === 0) {
      errors.push(`skill ${skill.name}: triggers missing or empty`);
    }

    if (skill.path !== undefined && !SKILL_PATH.test(skill.path)) {
      errors.push(`skill ${skill.name}: path "${skill.path}" must match skills/<name>/SKILL.md`);
    }

    if (skill.language !== undefined && !KNOWN_LANGUAGES.includes(skill.language.toLowerCase())) {
      warnings.push(`skill ${skill.name}: language "${skill.language}" is not in the known set`);
    }

    if (skill.version !== undefined && !SEMVER.test(skill.version)) {
      errors.push(`skill ${skill.name}: version "${skill.version}" is not semver`);
    }

    if (skill.schema_version !== undefined && skill.schema_version !== 3) {
      errors.push(`skill ${skill.name}: schema_version is ${skill.schema_version}, expected 3`);
    }

    if (skill.companion_owners !== undefined) {
      if (!Array.isArray(skill.companion_owners) || skill.companion_owners.length === 0) {
        errors.push(`skill ${skill.name}: companion_owners declared but empty`);
      } else {
        for (const owner of skill.companion_owners) {
          if (!COMPANION_OWNER.test(owner)) {
            errors.push(`skill ${skill.name}: companion_owner "${owner}" must be <pack>/<skill>`);
          }
        }
      }
    }
  }

  // ---- cross_pack section --------------------------------------------------
  const crossPack = parseCrossPackSection(text);
  if (!crossPack) {
    warnings.push("cross_pack section absent — this pack declares no companions");
  } else {
    if (crossPack.schema_version !== null && crossPack.schema_version !== 3) {
      errors.push(`cross_pack.schema_version is ${crossPack.schema_version}, expected 3`);
    }

    if ((crossPack.companions ?? []).length === 0) {
      warnings.push("cross_pack.companions is empty — no companion packs declared");
    }
    for (const companion of crossPack.companions ?? []) {
      for (const key of ["pack", "repo", "pinned_ref", "language"]) {
        if (!companion[key] || !String(companion[key]).trim()) {
          errors.push(`companion ${companion.pack ?? "<unknown>"}: missing ${key}`);
        }
      }
      if (companion.repo && !String(companion.repo).startsWith("https://")) {
        errors.push(`companion ${companion.pack}: repo must be an https URL`);
      }
      if (companion.language && !KNOWN_LANGUAGES.includes(companion.language.toLowerCase())) {
        warnings.push(`companion ${companion.pack}: language "${companion.language}" is not in the known set`);
      }
    }

    for (const collision of crossPack.name_collisions ?? []) {
      for (const key of ["skill_name", "companion_pack"]) {
        if (!collision[key] || !String(collision[key]).trim()) {
          errors.push(`name_collision ${collision.skill_name ?? "<unknown>"}: missing ${key}`);
        }
      }
      if (collision.resolution && !COLLISION_RESOLUTIONS.includes(collision.resolution)) {
        errors.push(
          `name_collision ${collision.skill_name}: resolution "${collision.resolution}" must be one of ${COLLISION_RESOLUTIONS.join(", ")}`
        );
      }
    }

    const skillNames = new Set(skills.map((skill) => skill.name));
    for (const seam of crossPack.seam_contracts ?? []) {
      for (const key of ["boundary", "primary_in_this_pack", "companion_pack", "companion_side"]) {
        if (!seam[key] || !String(seam[key]).trim()) {
          errors.push(`seam_contract ${seam.boundary ?? "<unknown>"}: missing ${key}`);
        }
      }
      if (seam.primary_in_this_pack && !skillNames.has(seam.primary_in_this_pack)) {
        errors.push(
          `seam_contract ${seam.boundary}: primary_in_this_pack "${seam.primary_in_this_pack}" is not a registered skill`
        );
      }
    }
  }

  // ---- adapters mapping ----------------------------------------------------
  const adapterEntries = parseAdapterEntries(text);
  for (const adapter of adapterEntries) {
    if (!ADAPTER_PATH.test(adapter.path)) {
      errors.push(`adapter ${adapter.name}: path "${adapter.path}" must match adapters/<name>/SKILL.md`);
    }
    if (!adapter.version_scope.trim()) {
      errors.push(`adapter ${adapter.name}: version_scope missing`);
    }
    if (!adapter.source.startsWith("https://")) {
      errors.push(`adapter ${adapter.name}: source must be an https URL`);
    }
  }

  return { errors, warnings };
}

function parseAdapterEntries(text) {
  const adapters = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(/^  ([a-z0-9-]+):$/);
    if (!match) continue;
    const pathLine = lines[i + 1] ?? "";
    if (!pathLine.startsWith("    path: adapters/")) continue;
    adapters.push({
      name: match[1],
      path: pathLine.slice("    path: ".length).trim(),
      version_scope: (lines[i + 2] ?? "").slice("    version_scope: ".length).trim(),
      source: (lines[i + 3] ?? "").slice("    source: ".length).trim(),
    });
  }
  return adapters;
}
