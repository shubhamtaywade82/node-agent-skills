---
name: node-skill-pack-installation
description: Use when installing, linking, distributing, or consuming the pack in an agent environment, or when assessing compatibility across agent runtimes and editor integrations.
---

# Skill Pack Installation

## Purpose

Deliver the pack to coding agents explicitly and reversibly: a developer installs or links the pack into an agent's skills directory, the pack stays portable across runtimes and editor integrations, and anything consumed outside the source repository comes from a derived, verifiable export. Installation is a compatibility contract — a pack that only works in one vendor's lookup layout is not portable.

## Activate when

- A developer wants to use this pack from a local or user-level agent environment.
- The pack must be copied, exported, or consumed outside its source repository.
- Compatibility with more than one agent runtime or editor integration must be assessed or preserved.
- An installed agent cannot discover skills, or discovery behaves differently across vendors.

## Boundary with related skills

- Use `node-skill-packaging` for the release artifacts being installed and the pack format contract.
- Use `node-skill-pack-manifest-governance` for the registry the installation validates against.
- Use `node-agentskills-compatibility` for Agent Skills standard conformance details.
- Use `node-agent-installation` for the consumer-side installation contract of a single skill.

## Repository inspection

1. Detect the agent's skills directory layout and lookup order (project-level vs user-level).
2. Identify the authoritative source of metadata and filesystem contents (manifest version, git revision, export checksum).
3. Inspect compatibility assumptions: which vendor lookup paths are supported, which behaviors are vendor-specific.
4. Review existing tests and CI gates before editing; check installed revisions against the current release.

## Decision rules

| Concern | Rule |
|---|---|
| Explicitness | Installation is explicit, reversible, and never mutates unrelated projects. |
| Portability | Keep portable core behavior independent from any specific agent vendor; vendor lookup paths are documented separately from the format. |
| Derived artifacts | Treat exported/copied trees as derived outputs — validate them against the source manifest, never edit in place. |
| Collision safety | Installing over an existing skills directory must detect name collisions before overwriting anything. |
| Reversibility | Provide a clean uninstall path and record the installed revision. |
| Verification | Prefer deterministic validation (manifest diff, discovery check) over subjective quality claims. |

## Implementation procedure

1. Choose the install target (project-level for repo-scoped agents, user-level for personal environments) and confirm the vendor lookup order.
2. Copy or symlink from a verified export — never from a dirty working tree.
3. Check for skill-name collisions with anything already in the target; refuse or ask before overwriting.
4. Verify discovery: the agent lists every expected skill with its metadata; run `node bin/skills.mjs list` (or the vendor equivalent).
5. Record the installed revision and checksum next to the installation.
6. Provide and test the uninstall path on a disposable target.

## Failure modes

- Copying into arbitrary directories or overwriting unrelated skills from another pack.
- Assuming one vendor's lookup path — the pack installs but the agent never discovers it.
- Installing from a dirty source tree — installed content diverges from any released version.
- Stale registry metadata after an upgrade — the agent routes to skills that no longer exist.
- No uninstall path, or one that leaves partial state behind.
- Skipping the discovery check — installation "succeeds" while the agent resolves nothing.

## Verification

1. Add failing contract coverage before behavioral changes; run focused tests for the changed lifecycle.
2. Install → discover → uninstall on a disposable target; assert clean state before and after.
3. Verify installed revision/checksum metadata matches a released artifact.
4. Exercise at least one non-default agent layout to confirm portability of the core contract.
5. Run `npm run validate` and `npm test`; inspect the exported/distributed file set.
