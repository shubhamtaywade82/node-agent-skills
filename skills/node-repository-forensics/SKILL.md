---
name: node-repository-forensics
description: Use when you need to understand structure, runtime entrypoints, package boundaries, build/test commands, or deployment assumptions.
---

# Repository Forensics

## Purpose

mapping an unfamiliar Node.js/TypeScript repository before changing it.

## Activate when

- you need to understand structure, runtime entrypoints, package boundaries, build/test commands, or deployment assumptions.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

treat checked-in files, lockfiles, CI, and package metadata as evidence; separate facts from hypotheses; preserve generated/configured boundaries

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Inventory package manager and workspaces.\n2. Identify entrypoints.\n3. Map scripts and CI.\n4. Trace dependency direction.\n5. Locate tests/config.\n6. Record conventions.\n7. Only then edit.

## Failure modes

Avoid:

- guessing architecture from directory names; editing generated output; overlooking alternate packages; relying on stale README claims.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
