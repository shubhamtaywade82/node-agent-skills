---
name: node-data-import-export
description: Use when CSV/JSON/NDJSON or archive imports/exports are introduced.
---

# Data Import and Export

## Purpose

moving structured data across system boundaries with validation, versioning, and safe failure semantics.

## Activate when

- CSV/JSON/NDJSON or archive imports/exports are introduced.
- The system has a state, contract, or performance boundary that benefits from explicit ownership.

## Repository inspection

1. Detect runtime, package manager, persistence layer, messaging, and test framework.
2. Locate the authoritative data owner and current transaction boundaries.
3. Trace consumers, derived state, background jobs, and operational tooling.
4. Inspect migrations, existing tests, and deployment assumptions.

## Decision rules

formats are versioned; input is untrusted; imports are staged/validated before commit; exports respect authorization and privacy; large jobs stream or run asynchronously

- Keep the design proportional to actual complexity; do not introduce distributed patterns by default.
- Runtime validation and authorization remain explicit at trust boundaries.
- Durability, consistency, retry, and replay semantics must be documented.
- Prefer deterministic, idempotent operations for recovery paths.

## Implementation procedure

1. Define format/schema.
2. Validate rows.
3. Stage and deduplicate.
4. Report row-level failures.
5. Commit in bounded units.
6. Stream exports.
7. Redact sensitive fields.
8. Support resumability where needed.

## Failure modes

Avoid:

- trusting imported IDs; partially applying malformed files with no report; exporting unauthorized tenant data; buffering huge files.
- Unbounded memory, concurrency, retries, or scans.
- Silent consistency changes that are not reflected in the API or operator contract.

## Verification

1. Add focused tests before changing observable behavior.
2. Exercise concurrency, replay, partial failure, and recovery cases relevant to the pattern.
3. Verify data invariants at the authoritative boundary.
4. Run focused tests and the full suite.
5. Run typecheck/build/lint and migration/deployment gates when applicable.
