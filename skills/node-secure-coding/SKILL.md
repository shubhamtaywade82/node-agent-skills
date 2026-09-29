---
name: node-secure-coding
description: Use when a change handles untrusted input, dynamic evaluation, filesystem/process access, deserialization, redirects, or sensitive data.
---

# Secure Coding

## Purpose

implementing backend code with explicit defenses against common Node.js application flaws.

## Activate when

- a change handles untrusted input, dynamic evaluation, filesystem/process access, deserialization, redirects, or sensitive data.
- The change crosses a trust, compatibility, architecture, data, or delivery boundary.
- Existing repository conventions and production constraints must be preserved.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests.
4. Confirm exact dependency versions before applying library-specific guidance.

## Decision rules

make dangerous capabilities narrow and explicit; validate before use; prefer safe APIs; encode output by context; avoid dynamic code execution; fail closed

- Prefer incremental, reversible changes over broad rewrites.
- Treat runtime data and external systems as untrusted until validated.
- Make compatibility, ownership, and failure behavior explicit.
- Do not weaken tests or validators to make a migration appear green.

## Implementation procedure

1. Identify attacker-controlled inputs.
2. Locate dangerous sinks.
3. Choose safe primitives.
4. Isolate privileged operations.
5. Add negative tests.
6. Inspect logs/errors for leakage.

## Failure modes

Avoid:

- string concatenated SQL/commands; eval-like execution; unsafe object merging; path traversal; reflected sensitive data; relying on lint alone.
- Hidden consumers, implicit contracts, or operational assumptions that are not verified.
- Tests that only exercise the happy path.

## Verification

1. Establish or extend deterministic tests before changing behavior.
2. Verify compatibility, failure, cleanup, and rollback/roll-forward behavior as applicable.
3. Run focused tests and the full repository suite.
4. Run build/typecheck/lint/deployment gates defined by the repository.
5. Record evidence, residual risk, and operator-facing follow-up.
