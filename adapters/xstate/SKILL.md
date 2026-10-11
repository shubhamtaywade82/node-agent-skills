---
name: xstate
description: Use when a Node.js backend uses XState 5 for state machines, workflow orchestration, or long-running business processes.
---

# XState Adapter

## Purpose

Translate the framework-neutral workflow/state contract onto XState 5, where `createMachine` and `createActor` model stateful behavior with explicit transitions, guards, actions, and persistence.

## Activate when

- Detect `xstate` and/or `@xstate/node` in dependencies.
- See `setup({ ... })`, `createMachine({ ... })`, `createActor`, `fromPromise` in source.

## Repository inspection

1. `package.json` — `xstate` version (v5 breaking changes from v4), `@xstate/react`, `@xstate/node`.
2. Machine definitions — `createMachine({ id, initial, states, on })`. List the machines.
3. Actors — `createActor(machine)` or `setup({ actors: { ... } })`. Find where actors are spawned.
4. Actions/guards/services — `actions`, `guards`, `invoke`. Confirm they are typed.
5. Persistence — persist/state hydration. Find where state is stored (memory, Redis, DB).
6. Long-running — `@xstate/node` for server-side actors. Find the actor registry.

## Decision rules

| Concern | Rule |
|---|---|
| States | Each state has a unique name. Use `final` for terminal states. Use `history` for resume. |
| Transitions | Explicit `on: { EVENT: "nextState" }`. Avoid `on: { "*": ... }` except for catch-all. |
| Guards | Pure functions. No side effects. Read-only on context. |
| Actions | Side effects. Pure where possible (assign context). Impure via `invoke` (async, observable). |
| Context | Typed. `setup({ types: { context: ... } })`. No `any`. |
| Persistence | Serialize state to a store (DB, Redis). Hydrate on resume. Use `persist` middleware or `state.toJSON()`. |
| Long-running | Actors live across requests only if persisted. `@xstate/node` for server actors; otherwise ephemeral. |
| Testing | `createActor(machine).snapshot.matches("state")`. Test transitions, not implementation. |
| Visualization | `@xstate/inspect` for dev. State charts for documentation. |
| Versioning | Machine definition changes are breaking. Persisted state from old def may not hydrate on new def. Version the machine. |

## Implementation procedure

1. Detect the XState version (v4 vs v5). Read the machine definitions.
2. Type the context via `setup({ types: { context: ... } })`. No `any`.
3. Define explicit transitions; avoid catch-all.
4. Implement guards as pure functions; actions as pure assign where possible.
5. For persistence: serialize `state.toJSON()` to DB/Redis; hydrate via `createActor(machine, { snapshot })`.
6. Version the machine: store the version with the persisted state; migrate on hydration.
7. Test transitions via `snapshot.matches("expected")`.

## Failure modes

- Impure guard → non-deterministic transitions.
- Context typed as `any` → runtime crash on missing field.
- State not persisted → resume from start, double-charges.
- Machine definition changed; persisted state from old def hydrates wrong → undefined state name, crash.
- Actor spawned but never stopped → memory leak.
- `invoke` promise rejects without `onError` → actor stuck.

## Verification

- Run `createActor(machine).snapshot.matches("expected")` for each transition.
- Test resume: persist state, hydrate, send next event, confirm transition.
- Test version migration: persist with v1 def, hydrate with v2 def, confirm migration runs.
- Use `@xstate/inspect` to visualize during dev.
- Source references: https://xstate.js.org/docs/, https://stately.ai/docs/xstate/, https://xstate.js.org/docs/guides/persistence.html, https://xstate.js.org/docs/guides/actors.html, https://xstate.js.org/docs/guides/testing.html.
