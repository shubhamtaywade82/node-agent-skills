---
name: node-typescript-contracts
description: Use when designing or changing TypeScript strict types, generics, discriminated unions, tsconfig, public type exports, or declaration emit.
---

# Node TypeScript Contracts

## Purpose

Use TypeScript types to make illegal states unrepresentable. Public type surface is a contract; runtime truth is separate from compile-time types. This skill owns the boundary between "the code compiles" and "the code is correct."

## Activate when

- Tightening `tsconfig` strictness, changing `moduleResolution`, `verbatimModuleSyntax`, or `noUncheckedIndexedAccess`.
- Adding or changing public type exports (library surface, internal module boundaries).
- Introducing generics, discriminated unions, branded types, or type-level modeling.
- Emitting `.d.ts` declarations for a published package.
- Diagnosing "compiles in my IDE, fails in CI" — usually `tsconfig` mismatch.
- Deciding between `interface` vs `type`, `enum` vs union, `class` vs function.

## Repository inspection

1. `tsconfig.json` and `tsconfig.*.json` — read `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `moduleResolution`, `module`, `target`, `verbatimModuleSyntax`, `composite`, `references`.
2. `package.json` `exports` + `types` + `typesVersions` — confirm the public type surface matches the runtime surface.
3. Build output — `dist/` or `lib/`. Confirm `.d.ts` files are emitted for every public entry.
4. Type-only imports — grep for `import type`, `import { type X }`. Confirm the codebase distinguishes types from values.
5. Generics usage — grep for `<T>`, `extends`, `infer`. Find any unconstrained `T` (should be `T extends SomeConstraint`).
6. Discriminated unions — grep for `: { kind:`, `: { type:`. Confirm exhaustive switch with `default: never`.
7. Public API — find `index.ts` or `index.d.ts` exports. Confirm the public surface is documented and intentional.

## Decision rules

| Concern | Rule |
|---|---|
| Strictness | Start new projects at `strict: true`. Tighten `noUncheckedIndexedAccess` for libraries. |
| Runtime vs type | Types do not validate runtime data. Use `unknown` at boundaries; validate with `zod`/`valibot`/`ajv`. |
| Public surface | Every exported type is a contract. Changing it is a semver decision. |
| `enum` vs union | Prefer string-literal unions (`type Status = "active" | "inactive"`) over `enum` for closed sets; `enum` is fine for open sets or when reverse mapping is needed. |
| `interface` vs `type` | Use `interface` for objects that may be extended; `type` for unions and intersections. Pick one per file and stay consistent. |
| Generics | Constrain every type parameter. `T extends string` not bare `T`. |
| Discriminated unions | Use a single string literal field (`kind`, `type`) for unions; `switch` exhaustively with `default: never`. |
| Branded types | Use for IDs that must not be confused (`type UserId = string & { readonly __brand: "UserId" }`). |
| Declaration emit | `declaration: true` for libraries. Run `tsc --emitDeclarationOnly` to surface type-only errors. |
| `verbatimModuleSyntax` | Prefer on; forces explicit `import type` and prevents accidental value imports. |
| `@ts-expect-error` | Forbidden in production code. `@ts-ignore` doubly so. Use `@ts-expect-error` only with a comment explaining why. |
| Type assertions | Avoid `as`. Prefer type guards (`typeof`, `instanceof`, `Array.isArray`, user-defined `is` predicates). |

## Implementation procedure

1. State the contract: what shapes are valid, what are invalid. If you cannot write the invalid shapes down, the type is too loose.
2. Choose the contract mechanism: type, interface, union, generic, branded type.
3. Write the type first, before the implementation. The implementation should satisfy the type, not the other way around.
4. If the type is public, update `package.json` `exports`/`types` to expose it.
5. Add a type test: `expectTypeOf<...>` (vitest) or `// @ts-expect-error` lines that confirm the type rejects invalid shapes.
6. Run `tsc --noEmit` across the project and across all `tsconfig.*.json` files.
7. Run `tsc --emitDeclarationOnly` for published packages; inspect the emitted `.d.ts` for the public surface you intended.

## Failure modes

- `as` casts everywhere because the data layer returns `any` — runtime crashes that TypeScript never saw.
- `any` instead of `unknown` for parsed JSON → silent type drift, crashes in production.
- Bare `T` generics with no constraint → consumers pass nonsense types.
- Non-exhaustive `switch` on a union → new variant added, no compile error, runtime falls through.
- `enum` over a closed set that changes weekly → runtime values drift from compile-time names.
- Public type exported from one package, imported by another, but the runtime is not exported → "type exists but cannot be constructed."
- `verbatimModuleSyntax: false` → `import { X }` works at runtime when X is a type only → bundlers ship dead code or break.
- `@ts-expect-error` left after the underlying bug was fixed → error message in CI: "unused @ts-expect-error directive."

## Verification

- Run `tsc --noEmit` on every `tsconfig.json` in the project.
- Run `tsc --emitDeclarationOnly --outDir dist/types` and inspect the emitted `.d.ts`.
- Run a type test: `expectTypeOf<MyType>()` or `// @ts-expect-error` lines that should still error.
- Confirm no `@ts-ignore` or `@ts-expect-error` was added without a comment.
- Confirm `noUncheckedIndexedAccess` is on; surface any `string | undefined` that breaks compilation.
- Confirm `import type` is used for type-only imports (via `verbatimModuleSyntax`).
- Source references: https://www.typescriptlang.org/tsconfig/, https://www.typescriptlang.org/docs/handbook/2/everyday-types.html, https://www.typescriptlang.org/docs/handbook/2/generics.html, https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html.
