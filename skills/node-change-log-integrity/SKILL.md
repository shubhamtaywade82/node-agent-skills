---
name: node-change-log-integrity
description: Use when release notes, changelog, version metadata, or migration notes are edited.
---

# Change Log Integrity

## Purpose

keeping changelog/release metadata aligned with shipped repository changes.

## Activate when

- release notes, changelog, version metadata, or migration notes are edited.
- The change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, database topology, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, or release metadata boundaries.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

- The changelog must reflect the released artifact, not a guessed or hand-curated summary disconnected from history.
- Version headings and dates must match the release record.
- Breaking and security-relevant changes must remain discoverable after future edits.
- Published historical entries should not be silently rewritten to hide earlier behavior.

## Implementation procedure

1. Compare changelog entries with release tags or repository release metadata.
2. Check version ordering and date consistency.
3. Verify breaking and security changes are represented.
4. Generate or update the entry using repository conventions.
5. Preserve an auditable history of corrections.

## Failure modes

Avoid:

- invented changes; duplicate versions; notes that disagree with shipped code.
- Unbounded retries or shutdown waits.
- Mixing unrelated maintenance or release changes into a behavior fix.

## Verification

1. Add a failing regression/concurrency/contract test first.
2. Reproduce the baseline behavior.
3. Verify failure, contention, rollout, and cleanup paths as applicable.
4. Run focused tests and full repository gates.
5. Review operational and compatibility impact before shipping.
