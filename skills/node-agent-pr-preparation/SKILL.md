---
name: node-agent-pr-preparation
description: Use when an agent is ready to submit or update a PR.
---

# Agent PR Preparation

## Purpose

preparing a backend pull request with accurate scope, checks, and integration notes.

## Activate when

- an agent is ready to submit or update a PR.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- Base/head must describe the real integration relationship; never trust a stale PR description.
- PR scope must match the actual diff, tests, and declared capability wave.
- CI evidence must refer to the current head SHA and distinguish push from pull-request checks.
- Known conflicts, parent dependencies, generated artifacts, and residual risks belong in the PR record.
## Implementation procedure

1. Inspect base/head relationship.
2. Summarize changed boundaries.
3. List tests.
4. Note migrations/compatibility.
5. Verify checks.
6. Flag follow-ups.

## Failure modes

Avoid:

- stale PR descriptions; wrong base branch; hiding known failures; claiming readiness before CI.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
