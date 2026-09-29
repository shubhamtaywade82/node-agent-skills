---
name: node-property-testing
description: Use when correctness depends on invariants across many generated inputs, state transitions, parsers, serializers, or algorithmic edge cases in Node.js or TypeScript code.
---

# Property-Based Testing

## Purpose
Check general invariants over broad input spaces instead of enumerating only hand-picked examples.

## Activate when
- Parsers, serializers, normalizers, or pure functions have many edge cases.
- State machines have conservation or ordering invariants.
- Example tests leave a large input surface unexplored.

## Repository inspection
Inspect test framework, generators, public invariants, input domains, determinism, and shrink/debugging conventions.

## Decision rules
| Concern | Rule |
|---|---|
| Property | State the invariant before building the generator. |
| Domain | Generate realistic valid and invalid values from the real boundary. |
| Determinism | Record seeds or failing cases for reproduction. |
| Shrinking | Preserve minimal counterexamples as regression evidence. |
| Scope | Use property tests where broad invariants matter, not for trivial CRUD. |

## Implementation procedure
1. Write the invariant as a failing property.
2. Define generators for the input/state domain.
3. Add deterministic failure reproduction.
4. Shrink counterexamples.
5. Fix the owning defect.
6. Keep useful concrete regressions.

## Failure modes
- Generators only produce easy inputs.
- Properties restate implementation details.
- Random CI failures cannot be reproduced.
- Generated suites become slow enough to hide regressions.

## Verification
Run seeded suites and verify boundary, malformed, and representative valid cases satisfy the invariant.