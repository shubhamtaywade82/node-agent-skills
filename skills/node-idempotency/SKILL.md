---
name: node-idempotency
description: Use when making retried mutations safe, accepting idempotency keys, deduplicating commands, processing at-least-once delivery, or handling ambiguous client/network outcomes.
---

# Idempotency

## Purpose
Make repeated delivery of the same logical command converge on one observable outcome.

## Activate when
- A mutation may be retried after timeout, disconnect, or 5xx.
- A queue/webhook/event can deliver duplicates.
- A payment/order/provisioning operation must not run twice.

## Repository inspection
Find the business operation, durable transaction boundary, unique constraints, request identifiers, existing retry policy, and response replay behavior. Identify whether the same operation can arrive through multiple transport paths.

## Decision rules
| Concern | Rule |
|---|---|
| Identity | Define what makes two attempts the same logical operation. |
| Scope | Scope keys to tenant/account + operation where required. |
| Fingerprint | Bind a key to request parameters so a reused key with different input is rejected. |
| Persistence | Store deduplication state durably for the required replay window. |
| Response | Replay the original terminal outcome when safe. |
| Concurrency | Enforce uniqueness/claim semantics atomically; check-then-act is insufficient. |
| Retry | Do not retry a non-idempotent operation merely because a library call is safe to repeat. |

## Implementation procedure
1. Define operation identity and replay window.
2. Add a durable uniqueness/claim mechanism.
3. Persist the result or terminal state needed for safe replay.
4. Make side effects occur once from the authoritative state transition.
5. Reject key reuse with a different payload fingerprint.
6. Add concurrent-duplicate tests.

## Failure modes
- In-memory dedupe disappears on restart.
- Duplicate requests race before the first one records its key.
- Same key is accepted for different payloads.
- Deduplication exists at HTTP level but duplicate work still occurs in a worker.
- Responses cannot be reconstructed after the dedupe record outlives the original result.

## Verification
Test sequential duplicates, concurrent duplicates, same-key/different-payload, timeout-before-commit, worker redelivery, and dedupe expiration.
