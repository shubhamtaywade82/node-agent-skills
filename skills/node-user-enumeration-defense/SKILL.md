---
name: node-user-enumeration-defense
description: Use when login, signup, password reset, invite, or account lookup behavior can reveal identity existence.
---

# User Enumeration Defense

## Purpose

preventing attackers from discovering whether accounts exist through authentication and recovery endpoints.

## Activate when

- login, signup, password reset, invite, or account lookup behavior can reveal identity existence.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

externally visible responses should not unnecessarily distinguish existent/non-existent accounts; internal telemetry may preserve useful classification without leaking it

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Identify enumeration signals.
2. Normalize responses.
3. Equalize meaningful timing where practical.
4. Rate-limit abuse.
5. Verify email-dispatch side effects.
6. Test positive/negative flows.

## Failure modes

Avoid:

- different status/messages for unknown users; account existence in error payloads; rate limits applied only after account lookup.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
