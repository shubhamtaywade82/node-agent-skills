---
name: node-context-engineering
description: Use when an agent must reason over an unfamiliar or large Node.js/TypeScript repository.
---

# Agent Context Engineering

## Purpose

constructing the minimum repository context an AI coding agent needs for accurate backend changes.

## Activate when

- an agent must reason over an unfamiliar or large Node.js/TypeScript repository.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

context should be evidence-backed, scoped, and current; source files/config/tests outrank prose assumptions; avoid dumping irrelevant repository data

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Collect package/runtime metadata.
2. Identify relevant modules/tests/config/CI.
3. Summarize contracts.
4. Include only necessary adjacent code.
5. Track unknowns explicitly.

## Failure modes

Avoid:

- loading the whole repository; stale summaries; treating comments as authoritative over executable configuration.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
