---
name: node-database-advisory-locks
description: Use when multiple workers must coordinate work without locking application tables broadly, or when work cannot be naturally represented by row locks.
license: MIT
---

# Database Advisory Locks

## Purpose
Use advisory locks for cooperative serialization of database work across processes or transactions that row locks cannot express. This skill is the single owning skill for advisory locks in this pack; queue-owned coordination belongs to `node-queues`, and deadlock diagnosis belongs to `node-deadlock-diagnostics`, both of which compose with this skill.

## Activate when
- multiple workers must coordinate work without locking application tables broadly;
- work cannot be naturally represented by row locks;
- the change affects database concurrency, release/maintenance lifecycle, or process runtime behavior.

## Repository inspection
1. Detect Node.js/TypeScript version, framework, package manager, database topology, pool configuration, tests, build, and CI.
2. Locate the authoritative implementation and existing operational/release conventions.
3. Inspect transaction, rollout, signal, health, and release metadata boundaries; confirm how connections are pooled and reused.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules
Lock namespace and scope are explicit; session/transaction lifetime is safe for the pool in use; lock acquisition has a bounded policy.
- Correctness and operational safety take precedence over convenience.
- Prefer measured workload evidence over speculative tuning.
- Lock keys are deterministic and namespaced; never global magic numbers.
- Preserve authorization and consistency boundaries independently of transport or caching behavior.
- Keep rollback/roll-forward paths explicit and bounded.

## Implementation procedure
1. Identify the shared resource and the coordination granularity it actually needs.
2. Choose a lock key namespace and derivation scheme that is collision-free for the domain (hash inputs with a stable algorithm, verify range against `pg_locks` cardinality).
3. Choose transaction-scope (`pg_advisory_xact_lock`, auto-released at commit/rollback) or session-scope (`pg_advisory_lock`, explicit release) deliberately.
4. Bound the wait: acquire with a timeout policy (`SET lock_timeout` or a poll/retry loop with a ceiling), never an unbounded hang.
5. Release deterministically: session locks release on the connection's lifecycle — with a pool, release in a `finally` on the same client that acquired; never return a lock-holding client to the pool.
6. Test competing workers, crash recovery, and pool recycling.

## Failure modes
Avoid:
- global magic lock keys; hash collisions from underspecified key inputs;
- session locks on pooled connections without ownership tracking;
- holding locks across remote calls (HTTP, mail, filesystem) while other workers block;
- treating advisory locks as ownership proof against transactions (advisory locks serialize; they do not enforce integrity — pair with unique constraints where correctness demands it);
- deadlocks from inconsistent acquisition order; unbounded retries or shutdown waits;
- treating operational symptoms as proof of a single root cause;
- mixing unrelated maintenance or release changes into a behavior fix.

## Verification
1. Add a failing regression/concurrency/contract test first; reproduce the baseline behavior.
2. Verify failure, contention, crash-recovery, pool-return, and cleanup paths as applicable.
3. Run focused tests and full repository gates (`node --test test/*.test.mjs`, `node scripts/validate.mjs`).
4. Compare performance/diagnostic evidence before and after when the change touches a hot path.
5. Review operational and compatibility impact, then report exactly what was verified and what remains unverified.
