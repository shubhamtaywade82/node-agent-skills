---
name: node-database-statement-timeouts
description: Use when queries or transactions can run longer than API/request budgets.
---

# Database Statement Timeouts

## Purpose

setting database-side statement deadlines to bound server resource consumption.

## Activate when

- queries or transactions can run longer than API/request budgets.
- The change crosses a runtime/security boundary or database execution boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database driver, pooler, and test commands.
2. Locate the exact trust/resource boundary and existing timeout, cancellation, validation, and cleanup behavior.
3. Inspect deployment topology and operational limits.
4. Confirm exact dependency versions before using adapter-specific behavior.

## Decision rules

database timeout is part of end-to-end deadline; timeout errors are classified and connections remain reusable

- Time and resource limits must align across layers.
- Untrusted data is validated before expensive processing.
- Cancellation must preserve resource and transaction health.

## Implementation procedure

1. Map API deadline to DB timeout.\n2. Set safe default/max.\n3. Detect canceled statements.\n4. Test long queries.\n5. Verify connection recovery.\n6. Monitor timeout rates.

## Failure modes

Avoid:

- DB timeout longer than request lifetime; killing connections unnecessarily; retrying timed-out writes blindly.
- Treating local promise rejection as cancellation of remote work.
- Increasing resource limits to hide leaks or unbounded work.

## Verification

1. Add a failing regression/contract test first.
2. Exercise malformed, oversized, slow, canceled, and repeated cases as applicable.
3. Verify cleanup and resource reuse after failure.
4. Run full repository test and validation gates.
5. Review security, performance, and operational impact.
