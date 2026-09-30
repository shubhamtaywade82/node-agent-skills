---
name: node-agent-evidence-gathering
description: Use when a coding agent needs to understand existing behavior before proposing a change.
---

# Agent Evidence Gathering

## Purpose

collecting the minimum authoritative code, tests, configuration, and CI evidence needed for an implementation decision.

## Activate when

- a coding agent needs to understand existing behavior before proposing a change.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- The artifact that actually controls behavior outranks an artifact that merely describes it.
- A contradiction must be reproduced or resolved from stronger evidence; it is never permission to guess.
- Every material implementation decision should trace to a file, test result, command, or external contract.
- Stop gathering when more evidence cannot change the decision; context is a bounded resource.
## Implementation procedure

1. Identify hypothesis.
2. Locate source of truth.
3. Inspect adjacent tests/config.
4. Compare runtime and declared types.
5. Capture exact commands and relevant failures.
6. Distinguish facts from assumptions.

## Failure modes

Avoid:

- treating comments as contracts; loading unrelated code; inferring missing behavior from names alone.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
