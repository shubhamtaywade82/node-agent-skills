---
name: node-testing
description: testing
---

# Node Testing

## Purpose
Use when choosing or implementing Node.js backend tests, including unit, integration, API, contract, database, concurrency, property, fuzz, or end-to-end tests.

## Activate when
Test at the boundary that owns the contract using the smallest realistic test that proves behavior.

## Repository inspection
- Backend behavior changes.
- Test-scope decisions.
- Flaky test diagnosis.

## Decision rules
Inspect the existing test runner, configuration, fixtures, database setup, mocks, network controls, and CI commands.

## Implementation procedure
- Pure deterministic logic → unit.
- Module/database behavior → integration.
- HTTP contract → API integration or contract test.
- Full workflow → end-to-end.
- Unknown or combinatorial input → property/fuzz when risk justifies it.
- Use real infrastructure when mocks would erase the behavior under test.

## Failure modes
1. Identify the contract.
2. Write the smallest failing test.
3. Implement the minimal change.
4. Add negative and boundary cases.
5. Run focused tests then the broader suite.

## Verification
- Implementation-detail assertions.
- Mocking database behavior.
- Sleep-based timing.
- Shared mutable fixtures.
- Happy-path-only coverage.

## Source foundation
Record exact commands and observed results. Keep tests deterministic and isolated.
