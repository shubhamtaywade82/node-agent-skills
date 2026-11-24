---
name: node-idempotency
description: Use when making retried mutations safe, accepting idempotency keys, deduplicating commands, processing at-least-once delivery, or handling ambiguous client/network outcomes.
license: MIT
---

# Idempotency

## Purpose

Make repeated delivery of the same logical command converge on one observable outcome. The contract is three sentences: the same key plus the same payload always yields the same terminal result; a reused key with a different payload is rejected; concurrent duplicates behave exactly like sequential duplicates.

## Activate when

- A mutation may be retried after timeout, disconnect, or 5xx.
- A queue/webhook/event can deliver duplicates.
- A payment/order/provisioning operation must not run twice.

## Boundary with related skills

- Use `node-idempotency` for the operation-level dedup contract.
- Use `node-retry-timeouts` for when the caller should retry at all.
- Use `node-transactions` for the atomic unit that records dedup state plus the state transition.
- Use `node-transactional-outbox` when the "run once" includes publishing effects after commit.

## Repository inspection

Find the business operation, durable transaction boundary, unique constraints, request identifiers, existing retry policy, and response replay behavior. Identify whether the same operation can arrive through multiple transport paths (HTTP + queue + webhook) — the dedup store must be shared across all of them.

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

State machine per key (one row per logical operation):

```
ABSENT ──claim──▶ RUNNING ──commit──▶ SUCCEEDED {result}
                     │                    └─ replayed on duplicate
                     └──fail──▶ FAILED {error}   (terminal; retry requires a NEW key)
```

## Implementation procedure

1. Define operation identity and replay window.
2. Add a durable uniqueness/claim mechanism.
3. Persist the result or terminal state needed for safe replay.
4. Make side effects occur once from the authoritative state transition.
5. Reject key reuse with a different payload fingerprint.
6. Add concurrent-duplicate tests.

**Reference example** — claim-then-execute with atomic claim, replay, and fingerprint rejection:

```sql
-- The dedup table: the UNIQUE constraint IS the atomic claim
CREATE TABLE idempotency_records (
  tenant_id    text        NOT NULL,
  operation    text        NOT NULL,          -- e.g. 'charge'
  key          text        NOT NULL,          -- client-supplied idempotency key
  fingerprint  text        NOT NULL,          -- hash of the full request parameters
  status       text        NOT NULL,          -- 'running' | 'succeeded' | 'failed'
  result       jsonb,                         -- terminal response payload
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, operation, key)
);
```

```ts
export async function idempotentCharge(input: ChargeInput, ctx: Ctx): Promise<ChargeResult> {
  const key = ctx.requestId;                       // client-supplied Idempotency-Key header
  const fingerprint = sha256(input);

  // 1. Atomic claim: INSERT succeeds exactly once per (tenant, operation, key)
  const claim = await db.tx(async (tx) => {
    const existing = await tx.query(IdempotencyRecord, { tenantId, operation: "charge", key });
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        throw new KeyReuseError("idempotency key reused with different payload");   // 422
      }
      return { replayed: true, record: existing };                 // terminal: replay it
    }
    return { replayed: false, record: await tx.insert(IdempotencyRecord, {
      tenantId, operation: "charge", key, fingerprint, status: "running",
    })};
  });

  if (claim.replayed) {
    if (claim.record.status === "succeeded") return ChargeResult.parse(claim.record.result);
    if (claim.record.status === "failed")    throw new TerminalFailureError(claim.record.result);
    throw new ConflictError("operation in progress");              // 409: concurrent duplicate
  }

  // 2. Execute exactly once, inside the same durable transition
  try {
    const result = await chargeGateway(input);      // the single side-effectful call
    await db.tx(async (tx) => {
      await tx.update(IdempotencyRecord, { key }).set({ status: "succeeded", result });
      await tx.insert(OutboxEvent, { type: "charge.succeeded", payload: result });  // effects after commit
    });
    return result;
  } catch (error) {
    await db.update(IdempotencyRecord, { key }).set({ status: "failed", result: { error: message(error) } });
    throw error;
  }
}
```

Design notes: the claim and the business transition share the database (same durability domain); a crash after claim leaves a `running` row the reconciliation job resolves; the queue path (at-least-once delivery) inserts the same table with the message ID as key — one dedup store across transports.

## Failure modes

- In-memory dedupe (Map/Set) disappears on restart — duplicates land exactly when the process recycles.
- Duplicate requests race before the first one records its key (check-then-act without a UNIQUE constraint).
- Same key accepted for different payloads — charge amount changed between retries.
- Deduplication exists at HTTP level but duplicate work still occurs in a worker (two dedup domains).
- Responses cannot be reconstructed after the dedupe record outlives the original result — store the response payload in the record, not a pointer to deleted data.
- Treating `failed` as retryable with the same key — replaying the same failure forever; terminal failure needs a new key.
- Expired dedup rows (past the replay window) replayed as fresh — the window must cover the client's max retry horizon.

## Verification

Test sequential duplicates (same result object, second call does not touch the gateway mock), concurrent duplicates (one executes, others replay/409), same-key/different-payload (422 rejection), timeout-before-commit (ambiguous: claim exists, status running; reconciliation resolves), worker redelivery (message ID as key → single side effect), and dedupe expiration (row older than window → treated as absent). Assert with fake timers that the replay window arithmetic is exact.
