---
name: node-load-testing
description: Use when validating throughput, latency, concurrency limits, capacity, or overload behavior of Node.js services.
---

# Load Testing

## Purpose
Provide a focused production boundary for load testing without unnecessary architectural machinery.

## Activate when
- The repository contains the problem described by this skill.
- A change crosses the relevant application or infrastructure boundary.
- Existing tests do not fully prove the required contract.

## Repository inspection
Inspect the owning module, public interfaces, runtime/dependency configuration, tests, persistence or network boundaries, observability, and local conventions.

## Decision rules
- Keep ownership at the smallest module boundary that owns the contract.
- State invariants and externally observable behavior before implementation.
- Keep dependencies explicit and lifecycle ownership clear.
- Validate untrusted inputs at boundaries; preserve domain invariants internally.
- Make failure, compatibility, concurrency, and observability semantics explicit.
- Prefer the simplest design that satisfies the actual contract.

## Implementation procedure
1. Identify the owning boundary and existing conventions.
2. Write the smallest failing test for the missing behavior.
3. Implement the owning boundary and its dependencies.
4. Exercise relevant failure, security, concurrency, and compatibility paths.
5. Verify at the boundary where users or other systems observe the result.
6. Remove accidental complexity and document only durable decisions.

## Failure modes
- Framework or infrastructure details leak across the owning boundary.
- Tests verify implementation details rather than observable behavior.
- Global mutable state hides dependency ownership.
- Failure and cleanup behavior is left implicit.

## Verification
- Focused contract tests pass.
- Integration/E2E or operational checks cover cross-process boundaries when applicable.
- Security, observability, compatibility, and resource behavior are reviewed before shipping.
