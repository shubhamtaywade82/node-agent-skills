---
name: node-trace-context-propagation
description: Use when distributed tracing spans cross service or queue boundaries.
---

# Trace Context Propagation

## Purpose

preserving W3C trace context across Node.js HTTP, messaging, and asynchronous boundaries.

## Activate when

- distributed tracing spans cross service or queue boundaries.
- The change affects observability, generated artifacts, releases, maintenance, compatibility, or runtime upgrades.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, build/test commands, and deployment targets.
2. Locate authoritative schemas, generated artifacts, release metadata, and compatibility contracts.
3. Inspect CI matrices, dependency constraints, and runtime assumptions.
4. Confirm exact versions before applying upgrade-specific guidance.

## Decision rules

incoming trace context is validated and propagated only across trusted boundaries; context does not cross unrelated requests

- Treat compatibility as a tested contract, not an assumption.
- Keep generated and release artifacts reproducible.
- Prefer incremental maintenance with explicit rollback.
- Preserve security and observability during upgrades.

## Implementation procedure

1. Extract/validate context.
2. Create server span.
3. Propagate outbound context.
4. Link async jobs correctly.
5. Test missing/malformed context and concurrent requests.

## Failure modes

Avoid:

- global trace IDs; trusting arbitrary baggage; leaking context across requests.
- Bundling unrelated behavior changes into maintenance work.
- Treating documentation or generated output as authoritative when a schema/source exists.

## Verification

1. Add a failing regression/compatibility contract first.
2. Run focused tests and the complete repository gates.
3. Regenerate artifacts and verify deterministic output where relevant.
4. Exercise supported version combinations or representative upgrade workloads.
5. Document verified limitations and rollback conditions.
