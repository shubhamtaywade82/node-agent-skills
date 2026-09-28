---
name: node-testing
description: Use when choosing or implementing Node.js backend tests, including unit, integration, API, contract, database, concurrency, property, fuzz, or end-to-end tests.
---

# Node Testing

## Purpose
Test at the boundary that owns the contract using the smallest realistic test that proves behavior.

## Activate when
Change backend behavior, select test scope, or diagnose flaky tests.

## Repository inspection
Inspect the test runner, configuration, fixtures, database setup, mocks, network controls, and CI commands.

## Decision rules
Pure deterministic logic → unit. Module/database behavior → integration. HTTP contract → API/contract test. Full workflow → E2E. Unknown/combinatorial input → property/fuzz when justified. Use real infrastructure when mocks erase the behavior under test.

## Implementation procedure
1. Identify contract. 2. Write smallest failing test. 3. Implement minimal change. 4. Add negative/boundary cases. 5. Run focused then broader suite.

## Failure modes
Implementation-detail assertions; mocked database behavior; sleep-based timing; shared fixtures; happy-path-only coverage.

## Verification
Record exact commands and results. Keep tests deterministic and isolated.

## Source foundation
https://nodejs.org/api/test.html
