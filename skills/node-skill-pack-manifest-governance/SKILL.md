---
name: node-skill-pack-manifest-governance
description: Use when governing a skill pack's central manifest or registry — registration rules, routing metadata, evaluation coverage, and per-skill plus pack-level semantic versioning.
---

# Skill Pack Manifest Governance

## Purpose

Keep the machine-readable registry synchronized with the filesystem skill set, and govern what the registry drives: routing decisions (one primary per scenario, secondaries for context), evaluation coverage (every skill has regression evidence), and versioning (per-skill semver inside a pack-level semver, both changesets-driven). The registry is authoritative for routing metadata; the filesystem is authoritative for existence; validation enforces that both tell the same story.

## Activate when

- Adding, retiring, or renaming a skill and updating the central manifest/registry.
- Deciding routing metadata: primary/secondary assignments, triggers, categories, or collision handling.
- A skill or pack release changes skills, routing, metadata, or adapters, and the semver impact must be classified.
- Evaluation coverage for a new or modified skill must be provided or reviewed.

## Boundary with related skills

- Use `node-skill-packaging` for the pack format contract and release artifacts.
- Use `node-skill-pack-installation` for delivery to agent environments.
- Use `node-skill-evaluation-discipline` for writing individual eval cases.
- Use `node-change-log-integrity` for changelog records of manifest changes.

## Repository inspection

1. Detect the skill directory layout, manifest schema, router, validator, eval corpus, and package version.
2. Compare the registry against the directories: every registered skill exists, every skill directory is registered.
3. Check the version surfaces: pack-level version (package.json + changesets) and per-skill version fields.
4. Review the eval corpus for the affected skills before changing routing metadata.

## Decision rules

| Concern | Rule |
|---|---|
| Registry truth | The registry is authoritative for routing metadata; every registered skill exists on disk; duplicates and stale entries fail validation. |
| Routing | Every routing case has exactly one primary; secondaries add context, never ambiguity; trigger collisions between skills are resolved deliberately, not by luck. |
| Evaluation | A skill without eval coverage is not registered; routing or content changes update the corpus in the same change. |
| Pack version | Pack-level semver (changesets) classifies the release: skills added/enriched = minor, routing/metadata-only fixes = patch, removals or breaking contract changes = major. |
| Per-skill version | Each skill's version field advances when its observable behavior or guidance changes; per-skill semver is independent of pack-level version. |
| Counts | Skill/adapter counts are derived or contract-tested — a count hardcoded without a test rots silently. |
| Change review | Manifest changes are reviewed like code: diff the registry, not just the prose. |

## Implementation procedure

1. Classify the change: add, retire, rename, enrich, or re-point routing — each has a distinct registry, routing, eval, and versioning footprint.
2. Update the manifest (entry + triggers), the routing cases, and the eval corpus in the same change so all gates see one consistent story.
3. When retiring a skill, fold non-redundant guidance into the surviving owner first, then remove the directory and every reference (manifest, cases, evals, tests, docs).
4. Bump the per-skill version field for changed skills; write a changeset describing the pack-level impact.
5. Run the validator, the full test suite, and the routing evaluation; confirm counts move exactly as intended.
6. Let the Release PR consume the changeset; the pack version and per-skill versions advance together.

## Failure modes

- Editing the registry without the skill files (or vice versa) — validation fails or a phantom skill routes.
- Duplicate IDs, or a skill registered under two names.
- Stale counts hardcoded in tests, hiding drift until an unrelated change trips them.
- Routing changes shipped without eval updates — the corpus passes against metadata that no longer matches reality.
- A pack release consumed changesets that misclassified the impact (breaking change shipped as minor).
- Per-skill versions untouched while guidance changed — consumers cannot tell which skills moved.

## Verification

1. Add failing contract coverage before behavioral changes (registry ⇄ filesystem, routing references registered, eval coverage present).
2. Run `npm run validate` and `npm test` — the count assertions and routing tests are the gate.
3. Run the routing evaluator over the decision corpus; primaries must not regress.
4. Confirm per-skill version fields and the changeset tell the same story as the diff.
5. Review the manifest diff like code; record residual risk.
