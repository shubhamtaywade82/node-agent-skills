---
name: node-typescript-contracts
description: typescript
---

# Node Typescript Contracts

## Purpose
Use when TypeScript public contracts, strictness, discriminated unions, generics, or compiler configuration are part of a Node.js backend change.

## Activate when
Use TypeScript to make invalid states harder to represent while keeping runtime validation separate.

## Repository inspection
- Changing exported types.
- Designing domain states.
- Resolving compiler or module errors.

## Decision rules
Inspect tsconfig, Node version, module settings, generated types, strictness flags, and public API conventions.

## Implementation procedure
- Prefer existing strictness rather than repository-wide changes for one feature.
- Use discriminated unions for mutually exclusive states.
- Use unknown at untrusted boundaries.
- Use generics when a real input/output relationship exists.
- Separate transport types from domain types when ownership differs.

## Failure modes
1. Model valid states.
2. Separate public and internal contracts.
3. Make nullability explicit.
4. Narrow external values before use.
5. Add compile-time coverage and runtime tests for serialized input.

## Verification
- Assertions hide uncertainty.
- Partial is used as a domain model.
- Persistence internals leak through public types.
- Generics obscure rather than express a relationship.

## Source foundation
Run typecheck plus focused tests and verify emitted runtime behavior separately.
