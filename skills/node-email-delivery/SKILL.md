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

## Implementation procedure

1. Define message identity/idempotency.
2. Render from versioned templates.
3. Enqueue after durable state change.
4. Add provider timeout/retry policy.
5. Capture delivery status.
6. Handle bounce/complaint signals.
7. Minimize PII.

## Failure modes

Avoid:

- sending inline inside DB transactions; duplicate emails on retries; logging full message bodies; retrying permanent recipient failures.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
