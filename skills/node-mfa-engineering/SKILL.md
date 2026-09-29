---
name: node-mfa-engineering
description: Use when accounts require TOTP, WebAuthn, passkeys, recovery codes, or privileged step-up flows.
---

# Multi-Factor Authentication

## Purpose

implementing MFA enrollment, challenge, recovery, and step-up authentication safely.

## Activate when

- accounts require TOTP, WebAuthn, passkeys, recovery codes, or privileged step-up flows.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

MFA state is security-sensitive; enrollment requires authenticated proof; recovery is intentionally high-friction; secrets are encrypted/protected; replay is prevented

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Define factor lifecycle.
2. Protect enrollment secrets.
3. Verify challenge freshness.
4. Rate-limit attempts.
5. Issue recovery codes once.
6. Record assurance level.
7. Test recovery/lockout/clock-drift paths.

## Failure modes

Avoid:

- logging TOTP secrets; unlimited attempts; recovery that bypasses identity proof; treating factor enrollment as ordinary profile data.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
