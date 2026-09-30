---
name: node-agent-risk-escalation
description: Use when requirements conflict, production credentials/data are involved, or a risky irreversible action is contemplated.
---

# Agent Risk Escalation

## Purpose

deciding when a coding-agent task should stop and request human input.

## Activate when

- requirements conflict, production credentials/data are involved, or a risky irreversible action is contemplated.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- State the exact human decision required before any irreversible operation.
- Escalate when two authoritative constraints cannot both be satisfied.
- Never use production secrets or sensitive data as substitute evidence.
- Prefer a safe no-op or reversible diagnostic over inventing a security or data policy. - Record the human decision required before proceeding.
## Implementation procedure

1. Identify blocking uncertainty.
2. Classify impact.
3. Attempt repository-safe alternatives.
4. State exact decision needed.
5. Preserve current safe state.

## Failure modes

Avoid:

- silently choosing security policy; using production data to investigate; pushing through irreversible migration.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
