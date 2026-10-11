---
name: node-architecture
description: Use when designing or changing Node.js backend module boundaries, dependency direction, dependency injection, or modular architecture.
---

# Node Architecture

## Purpose

Design boundaries around ownership and dependency direction rather than framework folder names. The architecture layer is the longest-lived decision in a Node.js backend; getting it wrong produces the coupling, hidden cycles, and "service-layer dumping ground" patterns that take years to undo. This skill is the first one to load when you introduce a subsystem, move domain behavior, or add ports/adapters/dependency injection.

## Activate when

- A new subsystem or bounded context is being introduced.
- Domain behavior is being moved between modules.
- Ports, adapters, or dependency injection are being added or changed.
- Circular imports or hidden couplings are being diagnosed.
- The repository has a `src/services/` or `src/utils/` style dumping-ground folder growing without bounds.

## Repository inspection

Before restructuring, gather evidence in this order:

1. `package.json` — confirm ESM vs CommonJS (`"type": "module"`), Node engine version, and scripts that drive build/test.
2. `tsconfig.json` — read `compilerOptions.paths`, `rootDirs`, `moduleResolution`, and `composite`/`references` to understand module boundaries the toolchain already knows about.
3. Entry points — `src/index.ts`, `src/main.ts`, `src/server.ts`, and any exports declared in `package.json` `exports` field.
4. Import graph — run `madge --circular src/index.ts` or grep for `from "\\.\./"` cross-package imports in a monorepo.
5. Test seams — read test files to find what behavior is mocked vs what is exercised through real boundaries.
6. Existing conventions — read 2-3 representative modules to learn the local naming pattern (`*Service`, `*Repository`, `*Controller`, `*Handler`).
7. README/AGENTS.md — confirm the architecture intent and any naming conventions already documented.

## Decision rules

| Concern | Rule |
|---|---|
| Modular monolith | Prefer one deployable with strict internal boundaries unless independent deployment is a documented constraint. |
| Dependency direction | Dependencies point toward stable contracts (domain) and away from volatile details (framework, I/O). |
| Transport in domain | HTTP, queue, and ORM types must not appear in domain modules. Map at the boundary. |
| Composition root | All wiring happens in one place (`src/composition-root.ts` or equivalent). Domain modules never resolve their own dependencies. |
| Public surface | A module exposes only what consumers need; internal helpers stay in `internal/` or are unexported. |
| Cyclic imports | Treat as a defect; fix the boundary, not the import. |
| Folder layout | Folders reflect boundaries, not technical layers. `src/orders/` not `src/controllers/orders-controller.ts + src/services/orders-service.ts + src/repositories/orders-repo.ts`. |
| Shared mutable state | Crossing a boundary requires an explicit contract; never share a singleton that holds domain state. |

## Implementation procedure

1. Map responsibilities and the call graph for the area being changed. Draw the dependency arrows on paper or in a diagram tool.
2. Identify the owning boundary — the module that should hold the behavior. If no boundary fits, the work is "introduce a new boundary," not "add code somewhere."
3. Define the public contract: types, error set, and observable behavior of the boundary.
4. Move behavior behind the contract. Update all call sites to use the new surface.
5. Wire dependencies in the composition root. Domain modules take dependencies as constructor parameters, never import infrastructure directly.
6. Add boundary tests that exercise the public contract without leaking internal types.
7. Run typecheck, the focused boundary tests, the full test suite, and import/cycle checks.

## Failure modes

- Service-layer dumping ground: a `*Service` class accumulates unrelated behavior because no boundary was drawn.
- Circular imports between modules that were split too eagerly along technical lines.
- Pattern-driven abstractions: introducing a Repository/Factory/Strategy because the pattern exists, not because the boundary needs it.
- Shared mutable state crossing boundaries through a singleton, a global cache, or a Node module-level variable.
- Framework types (`Request`, `Response`, `EntityManager`) leaking into domain modules.
- Test-only constructors that take dependencies but production code that uses `new` directly — the boundary is unenforced.

## Verification

- Run `tsc --noEmit` to confirm the public types compile in isolation.
- Run the boundary's focused tests (`node --test test/<boundary>.test.mjs` or `vitest run <boundary>`).
- Run the full test suite.
- Run an import/cycle check: `npx madge --circular --extensions ts src/index.ts` or the repository's own cycle detector.
- Inspect the diff for any new imports of framework or infrastructure types from domain modules.
- Source references: https://nodejs.org/api/packages.html and https://nodejs.org/api/esm.html for module semantics; https://martinfowler.com/bliki/PortsAndAdapters.html for the ports-and-adapters framing.
