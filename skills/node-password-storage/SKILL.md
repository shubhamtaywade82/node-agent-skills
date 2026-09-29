---
name: node-password-storage
description: Use when password credentials are created, changed, or verified.
---

# Password Storage

## Purpose

storing and verifying user passwords with modern password-hashing practices.

## Activate when

- password credentials are created, changed, or verified.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

passwords must never be reversible; use an adaptive password KDF with per-password salt; parameters are explicit; compare through the library; plan rehashing

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Choose supported password KDF.
2. Configure cost parameters.
3. Hash with unique salt.
4. Verify.
5. Rehash on successful login when parameters change.
6. Protect reset flow.
7. Test malformed hashes.

## Failure modes

Avoid:

- plain SHA hashes; reversible encryption; fixed global salt; logging password material; timing-sensitive custom comparison.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
