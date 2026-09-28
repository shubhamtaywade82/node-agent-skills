---
name: node-typescript-contracts
description: Use when TypeScript public contracts, strictness, discriminated unions, generics, or compiler configuration are part of a Node.js backend change.
---

# Node Typescript Contracts

## Purpose
Use TypeScript to make invalid states harder to represent while keeping runtime validation separate.

## Activate when
Change exported types, model domain states, or resolve compiler/module errors.

## Repository inspection
Inspect tsconfig, Node version, module settings, generated types, strictness flags, and public API conventions.

## Decision rules
Prefer repository strictness. Use discriminated unions for exclusive states. Use unknown at untrusted boundaries. Use generics for real relationships. Separate transport and domain types when ownership differs.

## Implementation procedure
1. Model valid states. 2. Separate public/internal contracts. 3. Make nullability explicit. 4. Narrow external values. 5. Add compile-time and runtime coverage.

## Failure modes
Assertions hide uncertainty; Partial used as a domain model; persistence internals leak into public types; abstraction-heavy generics.

## Verification
Run typecheck, focused tests, and verify emitted runtime behavior separately.

## Source foundation
https://www.typescriptlang.org/docs/handbook/2/narrowing.html
