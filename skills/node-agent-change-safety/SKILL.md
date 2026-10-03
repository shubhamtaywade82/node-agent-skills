---
name: node-agent-change-safety
description: Use when a patch can touch multiple modules or infrastructure boundaries.
---

# Agent Change Safety

## Purpose

controlling scope and blast radius of AI-generated backend changes.

## Activate when

- a patch can touch multiple modules or infrastructure boundaries.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- Declare blast radius before editing; unrelated cleanup is out of scope.
- Use a file or boundary allowlist for risky changes and expand it only when evidence requires it.
- Prefer additive and reversible changes when compatibility is uncertain.
- Cross-boundary changes require boundary-level regression coverage, not only internal unit tests. - Verify the file allowlist before expanding scope.
## Implementation procedure

1. Classify impact.
2. Define allowed files/boundaries.
3. Isolate behavior change.
4. Avoid unrelated refactors.
5. Add regression coverage.
6. Verify diff scope.

## Failure modes

Avoid:

- mixing cleanup with behavior change; broad search-and-replace; hidden generated/config changes.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
