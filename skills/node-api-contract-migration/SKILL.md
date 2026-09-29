---
name: node-api-contract-migration
description: Use when a breaking or semantic API change requires coordinated migration.
---

# API Contract Migration

## Purpose

planning and executing versioned API contract changes across producers and consumers.

## Activate when

- a breaking or semantic API change requires coordinated migration.
- The behavior crosses a public, persistence, messaging, security, or runtime boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, and relevant infrastructure.
2. Locate the authoritative contract and all direct consumers.
3. Inspect tests, schemas, migrations, queues, configuration, and CI.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

migrations need an overlap period when consumers cannot change atomically; old and new contracts have explicit ownership and retirement criteria

- Treat external/runtime data as untrusted until validated.
- Preserve existing invariants unless the task explicitly changes them.
- Prefer bounded, observable, idempotent operations.
- Keep security and authorization decisions at authoritative boundaries.

## Implementation procedure

1. Inventory consumers.
2. Define target contract.
3. Add compatibility layer.
4. Migrate consumers.
5. Measure old usage.
6. Announce deprecation.
7. Remove only after exit criteria.

## Failure modes

Avoid:

- flag-day migrations across independent consumers; compatibility shim without retirement plan.
- Silent compatibility, consistency, or security changes.
- Unbounded work, retries, storage, or fan-out.

## Verification

1. Write contract/regression coverage before behavior changes.
2. Exercise malformed input, duplicate/replay, migration, and recovery paths where applicable.
3. Run focused tests and the full repository suite.
4. Run typecheck/build/lint/package validation as supported.
5. Inspect the final diff for unintended contract or dependency changes.
