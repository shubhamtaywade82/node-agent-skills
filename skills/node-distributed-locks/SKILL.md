---
name: node-distributed-locks
description: Use when designing or changing distributed locks in a Node.js backend: Postgres advisory locks, Redis Redlock, lease-based coordination, or leader election.
---

# Node Distributed Locks

## Purpose

A distributed lock coordinates access across processes. Used wrong, it produces silent data corruption (two workers run the "exclusive" job) or livelock (no worker gets the lock). Use only when an atomic DB operation cannot do the job.

## Activate when

- Coordinating singleton jobs across replicas (cron, leader election, batch dispatch).
- Sequencing access to a shared resource that cannot be made atomic (e.g., external API with no idempotency).
- Implementing a Postgres advisory lock, Redis `SET NX EX`, or Redlock.
- Diagnosing deadlock, livelock, or stale lock holders.

## Repository inspection

1. Lock mechanism — grep for `pg_advisory_lock`, `SET NX EX`, `redlock`, `Redlock`, `acquireLock`, `lease`. Find the lock primitive.
2. TTL handling — grep for `expire`, `TTL`, `lease_duration`. Find the lock's lifetime.
3. Renewal — grep for `renew`, `extend`, `refresh_lock`. Find the heartbeat that keeps a long-lived lock alive.
4. Release — grep for `releaseLock`, `pg_advisory_unlock`, `DEL`. Find the release path; confirm it releases only the lock it holds.
5. Failure path — grep for `failed to acquire`, `lock not held`, `lock released`. Find what happens when the lock cannot be acquired.
6. Token/nonce — grep for `lockToken`, `nonce`, ` fencing_token`. Confirm the release uses a token to prevent releasing someone else's lock.

## Decision rules

| Concern | Rule |
|---|---|
| Atomic DB alternative | Prefer atomic DB operations (UNIQUE constraint, INSERT ... ON CONFLICT, advisory transaction lock) over a separate lock service. The lock and the work share a transaction. |
| Lock scope | Pick the smallest scope: lock a row, not a table; lock a single key, not the whole namespace. |
| TTL | Every lock has a TTL. Without one, a crashed process holds the lock forever. |
| TTL duration | TTL > p99 critical-section duration × safety margin (typically 3×). |
| Renewal | For long-lived critical sections, renew the lock with a heartbeat every TTL/3. Stop renewing on shutdown. |
| Fencing token | The release must use a fencing token (monotonic) to prevent a stale process from releasing a lock it no longer holds. |
| Idempotency | The critical section must be idempotent if the lock TTL can expire mid-work. |
| Failure to acquire | The caller must decide: retry with backoff, fail the request, or run without the lock (degraded). Never silently run without the lock. |
| Critical section | The lock holder must minimize the work between acquire and release. No HTTP calls, no queue publishes, no long sleeps inside the critical section. |
| Lock vs lease | Lock = mutual exclusion. Lease = the holder is authoritative until the lease expires. Use the right one. |
| Leader election | Use a real leader-election protocol (etcd lease, K8s lease, Postgres advisory) rather than rolling your own. |
| Observability | Lock acquire attempts, acquisitions, releases, expirations, contention must be metrics. |

## Implementation procedure

1. Identify the resource being locked. State the invariant: "exactly one worker runs job X at any time."
2. Decide if a DB constraint or atomic operation suffices. If yes, do not use a distributed lock.
3. Pick the lock primitive: Postgres advisory lock (transaction-scoped or session-scoped), Redis `SET NX EX`, or Redlock (multi-Redis).
4. Pick the TTL: ≥ 3× the p99 critical-section duration. Document the number.
5. Pick the renewal strategy: heartbeat every TTL/3 if the critical section is long. Stop renewing on shutdown.
6. Pick the fencing token: monotonic counter stored with the lock; release checks the token.
7. Pick the failure path: retry with backoff, fail the request, or degraded mode.
8. Add observability: acquire attempts, acquisitions, releases, expirations, contention.
9. Test under contention: spin up N processes; confirm exactly one acquires; confirm the others retry or fail.

## Failure modes

- Lock with no TTL → crashed process holds the lock forever.
- Lock TTL < critical section duration → lock expires mid-work; another worker acquires; both run.
- Release without fencing token → stale process releases the lock the current holder needs.
- Critical section makes an HTTP call → network stalls; TTL expires; another worker runs; data corruption.
- `DEL` to release without checking the value → releases another worker's lock.
- Redlock used when a single Postgres advisory lock would suffice → extra failure mode, no benefit.
- Lock acquired in a different process than the work → network jitter, GC pause, or OS scheduling delay causes TTL expiry mid-work.
- Lock used as a performance optimization instead of correctness → silently broken under load when the lock is contended.
- Lock release in the `finally` block but the process crashed between acquire and try-block entry → lock held forever.
- No observability → operator cannot tell if the lock is the bottleneck.

## Verification

- Test happy path: one worker acquires, does work, releases.
- Test contention: N workers attempt to acquire; confirm exactly one succeeds; others retry or fail.
- Test TTL expiry: acquire, do not renew, wait past TTL, confirm another worker can acquire.
- Test fencing: acquire, let TTL expire, acquire in another worker, confirm the stale release fails.
- Test crash recovery: kill the lock holder mid-critical-section; confirm the lock eventually expires and another worker acquires.
- Test critical section: confirm no HTTP calls, queue publishes, or long sleeps inside the lock.
- Inspect metrics: confirm acquire attempts, acquisitions, releases, expirations, contention are visible.
- Source references: https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS, https://redis.io/docs/reference/patterns/distributed-locks/, https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html, https://raft.github.io/, https://martinfowler.com/bliki/TwoHardThings.html.
