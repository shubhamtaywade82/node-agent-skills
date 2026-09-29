---
name: node-bulkheads
description: Use when isolating concurrency or resource capacity so one dependency, tenant, endpoint, or workload cannot exhaust the entire Node.js service.
---

# Bulkheads

## Purpose
Separate capacity budgets so localized failures remain localized.

## Activate when
- Multiple dependencies share the same process.
- One workload can saturate workers, sockets, DB connections, or queues.
- High-priority traffic needs protection from noisy neighbors.

## Repository inspection
Map worker pools, HTTP agent/socket limits, DB pools, queue concurrency, tenant quotas, and dependency criticality.

## Decision rules
| Concern | Rule |
|---|---|
| Scope | Isolate by failure domain: dependency, workload, tenant, or capability. |
| Capacity | Set explicit concurrency/queue limits for each bulkhead. |
| Priority | Preserve capacity for critical work when overload occurs. |
| Queue | Bound queued work; reject or shed when the budget is exhausted. |
| Fairness | Avoid one tenant/workload monopolizing shared capacity. |
| Observability | Record occupancy, queue wait, rejection, timeout, and saturation. |

## Implementation procedure
1. Identify the resource that can be exhausted.
2. Split capacity into meaningful failure domains.
3. Set admission and concurrency limits.
4. Define rejection/degradation behavior.
5. Measure saturation and downstream impact.
6. Revisit limits from production evidence.

## Failure modes
- Every dependency uses one shared unbounded pool.
- Bulkhead queues merely move unbounded memory growth.
- Per-tenant isolation creates thousands of idle pools.
- Critical traffic has no protected reserve.
- Capacity limits exist but have no telemetry.

## Verification
Load one domain to saturation while confirming unrelated work still progresses and high-priority traffic retains its budget.
