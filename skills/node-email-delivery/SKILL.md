---
name: node-email-delivery
description: Use when the backend sends invitations, receipts, alerts, password resets, or other transactional email.
---

# Email Delivery Engineering

## Purpose

building reliable transactional email delivery behind an explicit provider boundary.

## Activate when

- the backend sends invitations, receipts, alerts, password resets, or other transactional email.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

email is an external side effect; use a provider adapter; queue delivery when latency allows; never expose provider credentials; classify retries and permanent failures

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define message identity/idempotency.\n2. Render from versioned templates.\n3. Enqueue after durable state change.\n4. Add provider timeout/retry policy.\n5. Capture delivery status.\n6. Handle bounce/complaint signals.\n7. Minimize PII.

## Failure modes

Avoid:

- sending inline inside DB transactions; duplicate emails on retries; logging full message bodies; retrying permanent recipient failures.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
