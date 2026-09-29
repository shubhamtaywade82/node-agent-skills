---
name: node-outbound-webhooks
description: Use when the backend pushes webhooks to external HTTP endpoints.
---

# Outbound Webhook Delivery

## Purpose

delivering application events to customer endpoints with durable retries, signing, replay protection, and observability.

## Activate when

- the backend pushes webhooks to external HTTP endpoints.
- The change requires explicit reasoning over scope, contracts, or operational effects.

## Repository inspection

1. Detect Node.js/TypeScript versions, package manager, test/build commands, CI, and deployment conventions.
2. Identify the current behavior owner, related tests, and direct consumers.
3. Read the smallest set of files that establishes the relevant contract.
4. Record unresolved assumptions instead of inventing facts.

## Decision rules

delivery is asynchronous and at-least-once unless proven otherwise; signing covers the exact payload; endpoints are untrusted; retry schedules are bounded

- Preserve existing public behavior unless the task explicitly changes it.
- Prefer evidence from executable configuration, tests, lockfiles, and CI over stale prose.
- Keep each change auditable and reversible.

## Implementation procedure

1. Persist delivery intent.
2. Sign canonical payload.
3. Deliver with deadline.
4. Classify HTTP/network failures.
5. Retry transient failures.
6. Disable unhealthy endpoints safely.
7. Expose replay tooling and delivery status.

## Failure modes

Avoid:

- sending inline in transactions; unsigned payloads; infinite retries; treating 2xx as business success without validation; leaking secrets.
- Expanding scope without a verified dependency.
- Suppressing tests, validators, or warnings solely to get a green run.

## Verification

1. Establish failing/contract coverage before behavior changes.
2. Run focused tests or validators after each meaningful fix.
3. Run the complete repository gates before completion.
4. Inspect the final diff for unintended files, generated changes, and contract drift.
5. Record residual risk and follow-up work.
