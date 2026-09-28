---
name: node-architecture
description: Use when designing or changing Node.js backend module boundaries, dependency direction, dependency injection, or modular architecture.
---

# Node Architecture

## Purpose
Design boundaries around ownership and dependency direction rather than framework folder names.

## Activate when
Introduce a subsystem, move domain behavior, or add ports/adapters/dependency injection.

## Repository inspection
Inspect package.json, tsconfig, entrypoints, imports, module ownership, and test seams before restructuring.

## Decision rules
Prefer a modular monolith unless independent deployment is a documented constraint. Dependencies should point toward stable contracts. Keep transport concerns out of domain logic. Use a composition root for wiring.

## Implementation procedure
1. Map responsibilities and call graph. 2. Identify owning boundary. 3. Define public contract. 4. Move behavior behind it. 5. Wire dependencies. 6. Add boundary tests.

## Failure modes
Service-layer dumping grounds; circular imports; pattern-driven abstractions; shared mutable state crossing boundaries.

## Verification
Run typecheck, focused boundary tests, full tests, and import/cycle checks used by the repository.

## Source foundation
https://nodejs.org/api/packages.html
