---
name: node-skill-pack-evaluation-governance
description: Use when new or modified skills need regression evidence.
---

# Skill Evaluation Governance

## Purpose

maintaining adversarial and deterministic evaluation cases for skill activation and behavior.

## Activate when

- new or modified skills need regression evidence.
- The change concerns the skill pack itself or its delivery to AI coding agents.

## Repository inspection

1. Detect the current skill directory layout, manifest, router, validator, eval corpus, package version, and release workflow.
2. Identify the authoritative source of metadata and filesystem contents.
3. Inspect compatibility assumptions and vendor-specific integration points.
4. Review existing tests and CI gates before editing.

## Decision rules

evaluations test observable invariants and failure handling, not stylistic agreement; cases remain reproducible; pressure is explicit

- Keep portable core behavior independent from a specific agent vendor.
- Treat generated/exported artifacts as derived outputs.
- Prefer deterministic validation over subjective quality claims.
- Never weaken repository gates to make distribution or release succeed.

## Implementation procedure

1. Write representative case.
2. Define expected invariants.
3. Add adversarial pressure.
4. Verify routing.
5. Keep cases deterministic.
6. Review coverage on every skill addition.

## Failure modes

Avoid:

- testing prose similarity; flaky evals; deleting cases because a skill fails them; no negative scenarios.
- Stale registry metadata or untracked generated files.
- Releasing content that has not passed the repository's complete validation gate.

## Verification

1. Add failing contract coverage before behavioral changes.
2. Run focused tests for the changed pack lifecycle.
3. Run npm test and npm run validate.
4. Inspect the exported/distributed file set.
5. Verify version, revision, and checksum metadata.
