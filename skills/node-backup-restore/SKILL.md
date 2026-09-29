---
name: node-backup-restore
description: Use when databases, object stores, configuration, or critical state require recoverable backups.
---

# Backup and Restore

## Purpose

building reliable backup, retention, integrity, and restore workflows.

## Activate when

- databases, object stores, configuration, or critical state require recoverable backups.
- The change affects operational continuity, safety margins, or time-sensitive behavior.

## Repository inspection

1. Detect runtime, package manager, deployment topology, persistence, queues, observability, and CI.
2. Locate current state ownership, configuration, and operational controls.
3. Inspect failure handling, tests, runbooks, and infrastructure manifests.
4. Identify which behavior is critical and which may safely degrade.

## Decision rules

a backup is useful only if it can be restored; protect backups from application credentials; verify integrity and retention; document point-in-time requirements

- Recovery and failover procedures must be executable and observable.
- Do not weaken security or data integrity under failure.
- Make budgets, thresholds, ownership, and rollback/abort conditions explicit.
- Prefer deterministic tests and controlled exercises over assumptions.

## Implementation procedure

1. Classify data.
2. Choose backup method.
3. Encrypt/protect backups.
4. Set retention.
5. Verify backup success.
6. Schedule restore tests.
7. Measure age/RPO.
8. Document recovery evidence.

## Failure modes

Avoid:

- backups that are never restored; same credentials for backup and production writes; silent backup failures; retention gaps.
- Hidden operational dependencies or unbounded recovery work.
- Tests that validate only the happy path.

## Verification

1. Add focused tests before changing behavior.
2. Exercise failure, recovery, and boundary conditions.
3. Run repository tests and operational validation.
4. Verify observability exposes the transition and outcome.
5. Record residual risk and operator actions.
