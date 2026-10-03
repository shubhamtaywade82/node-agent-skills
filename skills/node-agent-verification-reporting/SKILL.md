---
name: node-agent-verification-reporting
description: Use when an agent has completed implementation and needs to communicate what was actually verified.
---

# Agent Verification Reporting

## Purpose

producing a factual verification report after a coding-agent change.

## Activate when

- an agent has completed implementation and needs to communicate what was actually verified.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- "Not run" is a first-class verification result; never turn unavailable evidence into confidence.
- Every result names its command, scope, and exact outcome rather than saying only "tested".
- A green unit test cannot stand in for an unrun integration, build, deployment, or security gate.
- Verification evidence must match the exact final commit being reported.
## Implementation procedure

1. List changed behavior.
2. Record focused tests.
3. Record full suite/build/lint/validate.
4. Inspect final diff.
5. State unverified assumptions and residual risk.

## Failure modes

Avoid:

- claiming tests passed without running them; omitting failing checks; reporting confidence instead of evidence.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
