#!/usr/bin/env node
// bin/cross-pack-verify.mjs (v3, additive)
//
// Verifies the cross-pack contract declared in this pack's skill-manifest.yml.
// Checks (parsers shared with lib/cross-pack-manifest.mjs; deep shape checks
// delegated to lib/v3-schema.mjs):
//
//   1. Structural v3 validity (lib/v3-schema.mjs): schema_version marker,
//      pack envelope, per-skill v3 field shapes, cross_pack section shape,
//      adapters mapping shape.
//   2. `cross_pack.companions[]` entries each have `pack`, `repo`,
//      `pinned_ref`, `language`, and (if `snapshot` is set) the snapshot file
//      exists and is not stale (>90 days by default; --staleness).
//   3. Each companion snapshot's `documented_name_collisions` matches the
//      recomputed intersection of this pack's skill names and the snapshot's.
//   4. `cross_pack.seam_contracts[]` primaries exist on disk
//      (skills/<name>/SKILL.md).
//   5. (Optional, when --companions is given) each companion pack found under
//      --companions declares a symmetric seam_contract pointing back.
//
// This script is purely additive — it does not replace `npm run validate`.
// Run after `npm run validate` for full coverage.
//
// Usage:
//   node bin/cross-pack-verify.mjs [--root <repo-root>] [--companions <skills-root>]
//                                  [--staleness <days>]
//
// Defaults:
//   --root         = env NODE_AGENT_SKILLS_ROOT or this script's parent
//   --companions   = (none; cross-pack symmetry check skipped)
//   --staleness    = 90 (days)
//
// Exit codes: 0 pass, 1 checks failed, 2 invocation error.

import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseSkillEntries,
  parsePackEnvelope,
  parseCrossPackSection,
  parseSnapshot,
} from "../lib/cross-pack-manifest.mjs";
import { validateManifestV3 } from "../lib/v3-schema.mjs";

function parseArgs(argv) {
  const options = { staleness: 90, root: null, companions: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--root") { options.root = next; i += 1; }
    else if (arg === "--companions") { options.companions = next; i += 1; }
    else if (arg === "--staleness") { options.staleness = parseInt(next, 10); i += 1; }
    else if (arg === "-h" || arg === "--help") {
      console.error(`Usage: node bin/cross-pack-verify.mjs [--root <path>] [--companions <path>] [--staleness <days>]
  --root         Repository root (default: env NODE_AGENT_SKILLS_ROOT or this script's parent)
  --companions   Skills root to scan for installed companion packs (default: skip symmetry)
  --staleness    Snapshot staleness threshold in days (default: 90)`);
      process.exit(0);
    } else {
      console.error(`unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!options.root) {
    options.root = process.env.NODE_AGENT_SKILLS_ROOT
      || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv);
  const root = options.root;
  const manifestPath = path.join(root, "skill-manifest.yml");

  if (!existsSync(manifestPath)) {
    console.error(`ERROR: manifest not found at ${manifestPath}`);
    process.exit(2);
  }

  const manifestText = await readFile(manifestPath, "utf8");
  const errors = [];
  const warnings = [];

  // 1. Structural v3 validity (deep shape checks).
  const schema = validateManifestV3(manifestText);
  errors.push(...schema.errors);
  warnings.push(...schema.warnings);

  const { pack } = parsePackEnvelope(manifestText);
  const crossPack = parseCrossPackSection(manifestText);
  const thisSkills = new Set(parseSkillEntries(manifestText).map((skill) => skill.name));

  if (crossPack) {
    for (const companion of crossPack.companions ?? []) {
      if (!companion.snapshot || !companion.snapshot.trim()) {
        warnings.push(`companion ${companion.pack} has no snapshot file declared — collision check skipped`);
        continue;
      }
      const snapshotPath = path.join(root, companion.snapshot);
      if (!existsSync(snapshotPath)) {
        errors.push(`companion ${companion.pack} snapshot file missing: ${companion.snapshot}`);
        continue;
      }
      const snapshot = parseSnapshot(await readFile(snapshotPath, "utf8"));

      // Freshness
      if (snapshot.captured_at) {
        const capturedDate = new Date(snapshot.captured_at);
        if (!Number.isNaN(capturedDate.getTime())) {
          const ageDays = Math.floor((Date.now() - capturedDate.getTime()) / 86_400_000);
          if (ageDays > options.staleness) {
            warnings.push(`companion ${companion.pack} snapshot is ${ageDays} days old (>${options.staleness}); refresh the snapshot file`);
          }
        } else {
          warnings.push(`companion ${companion.pack} snapshot captured_at unparseable: ${snapshot.captured_at}`);
        }
      } else {
        warnings.push(`companion ${companion.pack} snapshot has no captured_at date`);
      }

      // Collision intersection
      const companionSkills = new Set(snapshot.skills);
      const actualIntersection = [...thisSkills].filter((name) => companionSkills.has(name)).sort();
      const documented = [...new Set(snapshot.documented_name_collisions)].sort();
      const missingCollisions = actualIntersection.filter((name) => !documented.includes(name));
      const staleCollisions = documented.filter((name) => !actualIntersection.includes(name));
      if (missingCollisions.length > 0) {
        errors.push(`companion ${companion.pack} snapshot documented_name_collisions missing ${JSON.stringify(missingCollisions)} — actual intersection is larger than the registry`);
      }
      if (staleCollisions.length > 0) {
        errors.push(`companion ${companion.pack} snapshot documented_name_collisions has stale ${JSON.stringify(staleCollisions)} — registry lists names that no longer collide`);
      }
    }

    // Seam contract primaries exist on disk.
    for (const seam of crossPack.seam_contracts ?? []) {
      const primary = seam.primary_in_this_pack;
      if (!primary || !primary.trim()) continue; // v3-schema covers missing fields
      const skillPath = path.join(root, "skills", primary, "SKILL.md");
      if (!existsSync(skillPath)) {
        errors.push(`seam_contracts primary ${primary} not found at skills/${primary}/SKILL.md`);
      }
    }

    // Optional cross-pack symmetry.
    if (options.companions && existsSync(options.companions)) {
      checkCompanionSymmetry(options.companions, crossPack, pack, errors, warnings);
    }
  }

  if (warnings.length > 0) {
    console.error("WARNINGS:");
    for (const warning of warnings) console.error(`  - ${warning}`);
  }

  if (errors.length > 0) {
    console.error("ERRORS:");
    for (const error of errors) console.error(`  - ${error}`);
    console.error(`Cross-pack verification FAILED (${errors.length} error${errors.length === 1 ? "" : "s"}).`);
    process.exit(1);
  }

  const schemaVersionMatch = manifestText.match(/^schema_version:\s*(\d+)\s*$/m);
  console.log("Cross-pack verification PASSED.");
  console.log(`  schema_version: ${schemaVersionMatch ? schemaVersionMatch[1] : "(missing)"}`);
  console.log(`  pack:           ${pack.name ?? "(missing)"} (${pack.language ?? "?"} / ${pack.runtime ?? "?"})`);
  if (crossPack) {
    console.log(`  companions:     ${(crossPack.companions ?? []).length}`);
    for (const companion of crossPack.companions ?? []) {
      console.log(`    - ${companion.pack} (${companion.language}; pinned: ${companion.pinned_ref})`);
    }
    console.log(`  seam_contracts: ${(crossPack.seam_contracts ?? []).length}`);
    for (const seam of crossPack.seam_contracts ?? []) {
      console.log(`    - ${seam.boundary}: this=${seam.primary_in_this_pack}, companion=${seam.companion_side}`);
    }
  }
  process.exit(0);
}

function checkCompanionSymmetry(skillsRoot, crossPack, thisPack, errors, warnings) {
  if (!thisPack?.name) {
    warnings.push("cannot determine this pack's name — skipping symmetry check");
    return;
  }
  for (const companion of crossPack.companions ?? []) {
    const candidateDirs = [
      path.join(skillsRoot, companion.pack),
      path.join(skillsRoot, `.${companion.pack}`),
    ];
    let companionManifestPath = null;
    for (const dir of candidateDirs) {
      const direct = path.join(dir, "skill-manifest.yml");
      const nested = path.join(dir, `.${companion.pack}`, "skill-manifest.yml");
      if (existsSync(direct)) { companionManifestPath = direct; break; }
      if (existsSync(nested)) { companionManifestPath = nested; break; }
    }
    if (!companionManifestPath) {
      warnings.push(`companion ${companion.pack} not found under ${skillsRoot} — skipping symmetry check for this companion`);
      continue;
    }
    const companionCrossPack = parseCrossPackSection(readFileSyncText(companionManifestPath));
    if (!companionCrossPack) {
      warnings.push(`companion ${companion.pack} manifest at ${companionManifestPath} has no cross_pack section — skipping symmetry`);
      continue;
    }
    const mirror = (companionCrossPack.seam_contracts ?? []).find(
      (seam) => seam.companion_pack === thisPack.name && seam.primary_in_this_pack === companion.seam_skill
    );
    if (!mirror) {
      warnings.push(`companion ${companion.pack} does not declare a symmetric seam_contract pointing back at ${thisPack.name}/${companion.seam_skill} — seam routing will be one-directional`);
    }
  }
}

function readFileSyncText(filePath) {
  return readFileSync(filePath, "utf8");
}

main().catch((err) => {
  console.error(`FATAL: ${err.stack || err.message || err}`);
  process.exit(2);
});
