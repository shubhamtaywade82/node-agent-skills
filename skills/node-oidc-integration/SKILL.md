---
name: node-oidc-integration
description: Use when a backend signs users in through an OpenID Connect identity provider.
---

# OIDC Integration

## Purpose

integrating OpenID Connect providers with explicit issuer, discovery, nonce, token, and userinfo validation.

## Activate when

- a backend signs users in through an OpenID Connect identity provider.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

never trust discovery or ID token data without issuer/signature/audience/nonce checks; provider metadata must be pinned to expected issuer

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Configure trusted issuer.
2. Retrieve metadata through validated issuer.
3. Use authorization-code flow.
4. Validate ID token claims.
5. Map subject to local identity.
6. Handle key rotation.
7. Test invalid issuer/audience/nonce.

## Failure modes

Avoid:

- accepting any discovered issuer; trusting email as permanent identity key; skipping nonce; assuming token parsing means validation.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
