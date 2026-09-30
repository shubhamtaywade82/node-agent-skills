---
name: node-agent-preflight
description: Use when an agent is about to implement, refactor, upgrade, or debug code in an unfamiliar repository.
---

# Agent Preflight

## Purpose

establishing repository facts and constraints before an AI coding agent changes a Node.js backend.

## Activate when

- an agent is about to implement, refactor, upgrade, or debug code in an unfamiliar repository.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- Treat the current branch, commit, and working tree as the baseline; never infer them from a task description.
- Prefer executable configuration, lockfiles, tests, and current code over stale prose.
- Gather only the evidence needed to establish runtime, package manager, test gates, ownership, and scope.
- Record material unknowns explicitly and stop before risky edits when the baseline is incomplete.
## Implementation procedure

1. Inspect package.json/lockfile.
2. Inspect README/AGENTS/CONTRIBUTING.
3. Identify test/build/validate commands.
4. Map changed boundary and consumers.
5. Record unknowns.
6. Stop when critical context is missing.

## Failure modes

Avoid:

- starting edits from the task description alone; assuming framework/version; scanning the whole repository without scope.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
