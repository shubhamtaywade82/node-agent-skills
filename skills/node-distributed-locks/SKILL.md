---
name: node-distributed-locks
description: Use when coordinating exclusive work across Node.js processes or instances using leased locks, distributed coordination, fencing, or leader ownership.
---

# Distributed Locks

## Purpose
Distributed locks are coordination mechanisms with failure semantics, not substitutes for database constraints or ownership modeling.

## Activate when
- Only one worker should execute a task across replicas.
- A leader or lease holder coordinates shared work.
- Duplicate concurrent execution can corrupt state.

## Repository inspection
Identify resource owner, lock store, lease duration, renewal mechanism, crash behavior, clock assumptions, and whether the protected operation has a fencing/epoch check.

## Decision rules
| Concern | Rule |
|---|---|
| Ownership | The lock holder must have a durable identity and explicit lease semantics. |
| Lease | Set lease duration from worst-case pause/renewal latency, with margin. |
| Stale owner | If stale holders could corrupt state, use fencing/epoch tokens enforced by the protected resource. |
| Release | Release only when the caller still owns the lock; avoid deleting another owner's lease. |
| Timeout | Lock acquisition has a bounded wait. |
| Correctness | Prefer database uniqueness/atomic updates when they can enforce the invariant more directly. |

## Implementation procedure
1. State why exclusive coordination is required.
2. Choose lock store and ownership identifier.
3. Set bounded acquisition/lease/renewal timings.
4. Add fencing when stale owners can still write.
5. Define crash/restart recovery.
6. Test pauses longer than the lease and concurrent contenders.

## Failure modes
- Process pause expires lease while it continues executing.
- Release deletes a lock acquired by a new owner.
- Lock is treated as durable correctness while the protected DB write has no guard.
- Clock skew invalidates lease calculations.

## Verification
Test concurrent acquisition, owner crash, lease expiry, delayed renewal, stale owner writes, and recovery after restart.
