---
name: node-architecture
description: architecture
---

# Node Architecture

## Purpose
Use when designing or changing Node.js backend module boundaries, dependency direction, dependency injection, or modular architecture.

## Activate when
Design boundaries around ownership and dependency direction rather than framework folder names.

## Repository inspection
- Introducing a subsystem or shared service.
- Moving domain behavior.
- Adding ports, adapters, or dependency injection.

## Decision rules
Inspect package.json, tsconfig, entrypoints, source layout, imports, test seams, and module ownership before restructuring.

## Implementation procedure
- Prefer a modular monolith unless independent deployment is a documented constraint.
- Dependencies should point toward stable contracts.
- Keep transport concerns out of domain logic.
- Use a composition root for wiring.
- Add abstractions only for real variation, ownership, or test seams.

## Failure modes
1. Map responsibilities and the call graph.
2. Identify the owning boundary.
3. Define its public contract.
4. Move behavior behind that contract.
5. Wire dependencies at composition boundaries.
6. Add boundary tests before removing old seams.

## Verification
- Service-layer dumping grounds.
- Circular imports.
- Pattern-driven abstractions with no independent reason.
- Shared mutable state crossing module boundaries.

## Source foundation
Run typecheck, focused boundary tests, full tests, and import/cycle checks used by the repository.
