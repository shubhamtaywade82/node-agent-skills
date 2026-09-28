---
name: node-connection-pooling
description: Use when configuring PostgreSQL or relational database connection pools, sizing database clients across Node.js instances, or diagnosing pool exhaustion and connection storms.
---

# Connection Pooling

## Purpose
Treat database connections as a finite shared capacity budget across processes, replicas, jobs, and migrations.

## Activate when
- Creating or tuning a database client pool.
- Scaling a service horizontally.
- Diagnosing too many clients, pool timeouts, or connection churn.

## Repository inspection
Find pool size, process/replica count, worker concurrency, database max connections, idle timeouts, acquisition timeout, health checks, and long-running queries.

## Decision rules
| Concern | Rule |
|---|---|
| Budget | Total possible connections across all service instances must fit the database budget. |
| Checkout | Release clients in all success/error paths. |
| Queueing | Bound wait time for a connection; do not let request queues grow indefinitely. |
| Idle | Close or recycle idle connections according to workload and provider limits. |
| Workers | Count background-worker pools separately from HTTP pools. |
| Transactions | One checked-out connection owns a transaction for its full duration. |

## Implementation procedure
1. Calculate connection budget from DB limits and deployment topology.
2. Set per-process pool limits accordingly.
3. Configure bounded acquisition/connect timeouts.
4. Ensure clients are always released.
5. Measure wait time and pool utilization.
6. Load-test with realistic replica and worker counts.

## Failure modes
- Pool size copied from a single-process benchmark into Kubernetes.
- Each worker creates an unbounded pool.
- Failed requests leak checked-out clients.
- Health probes open a new connection for every probe.
- Pool exhaustion is mistaken for database CPU saturation.

## Verification
Test acquisition timeout, release on exceptions, transaction cleanup, deploy/shutdown drain, and multi-instance capacity.
