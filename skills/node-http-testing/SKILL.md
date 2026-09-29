---
name: node-http-testing
description: Use when API endpoints need request/response, middleware, headers, streaming, or lifecycle coverage.
---

# HTTP Integration Testing

## Purpose

testing backend HTTP contracts through real HTTP server behavior with bounded integration scope.

## Activate when

- API endpoints need request/response, middleware, headers, streaming, or lifecycle coverage.
- The change touches identity, HTTP testing, performance evidence, or failure-path verification.

## Repository inspection

1. Detect Node.js/TypeScript versions, test framework, HTTP framework, auth stack, and CI commands.
2. Inspect existing test helpers, server lifecycle, fixtures, and mocks.
3. Identify the security or performance contract being validated.
4. Detect exact library versions before applying adapter-specific mechanics.

## Decision rules

test the HTTP boundary as users consume it; keep transport assertions separate from domain assertions; avoid binding fixed ports unless required

- Runtime behavior, not TypeScript declarations, is the contract under test.
- Keep test environments deterministic and disposable.
- Preserve security controls while creating test seams.
- Prefer evidence-backed thresholds over arbitrary numbers.

## Implementation procedure

1. Start server on ephemeral/listenable port.
2. Send real HTTP requests.
3. Assert status/headers/body.
4. Exercise error/auth/rate-limit paths.
5. Close server and clients.
6. Verify streaming/disconnect cases.

## Failure modes

Avoid:

- testing only controller functions; fixed ports in parallel CI; not closing servers; assertions tied to framework internals.
- Hidden global state, non-deterministic timing, or leaked resources.
- Tests that weaken production behavior just to make setup easier.

## Verification

1. Write a failing test for the intended behavior or defect.
2. Exercise positive, negative, timeout, cleanup, and concurrency cases where relevant.
3. Run focused and full test commands using repository tooling.
4. Inspect resource cleanup and CI reproducibility.
5. Record benchmark/failure evidence and remaining limitations.
