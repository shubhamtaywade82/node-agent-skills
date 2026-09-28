---
name: node-distributed-systems
description: Use when a Node.js feature spans processes, instances, regions, services, or independently failing dependencies and consistency, coordination, or recovery must be designed explicitly.
---

# Distributed Systems

## Purpose
Distributed correctness comes from explicit failure and consistency models, not from assuming a network behaves like a local function call.

## Activate when
- A workflow spans services or multiple Node.js instances.
- Shared state, distributed coordination, or cross-service transactions are introduced.
- Debugging partial failures or inconsistent state.

## Repository inspection
Map service boundaries, network calls, durable stores, message paths, timeouts, retries, clocks, ownership, and recovery/reconciliation mechanisms.

## Decision rules
| Concern | Rule |
|---|---|
| Failure | Assume processes, networks, and dependencies can fail independently. |
| Consistency | State the required consistency per invariant instead of assuming global strong consistency. |
| Identity | Give commands/events durable IDs for tracing and deduplication. |
| Time | Treat clocks as imperfect; do not use local timestamps as a distributed truth source without a defined tolerance. |
| Transactions | Local DB transactions do not atomically include remote services. |
| Recovery | Every partial failure needs a retry, compensation, reconciliation, or manual-recovery path. |
| Ownership | Define one authoritative owner for each mutable invariant. |

## Implementation procedure
1. Draw the failure boundaries.
2. Name the authoritative state for each invariant.
3. Define message/request delivery semantics.
4. Establish deadlines and retry budgets.
5. Design compensation or reconciliation for partial completion.
6. Instrument correlation IDs and state transitions.

## Failure modes
- Two services both act as authoritative owners.
- Remote success occurs after the caller times out.
- A local transaction is assumed to include a downstream API.
- Event ordering is assumed globally.
- Recovery logic cannot distinguish replay from a new command.

## Verification
Test network timeout, partial commit, duplicate delivery, delayed messages, service restart, stale state, and reconciliation.
