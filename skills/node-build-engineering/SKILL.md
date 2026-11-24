---
name: node-build-engineering
description: Use when designing TypeScript compilation, project references, bundling, source maps, build caching, artifact generation, or multi-package Node.js build pipelines.
license: MIT
---

# Build Engineering

## Purpose

Make TypeScript builds deterministic, debuggable, and aligned with package/runtime boundaries. A build is a contract: the same inputs must produce the same artifacts (byte-identical where tooling allows), the published shape must match the package exports that consumers resolve, and a runtime error in an artifact must point back at real source.

## Activate when

- A repository has multiple TypeScript projects or packages.
- Build time, memory, or output correctness is a problem.
- Shipping compiled Node.js artifacts.

## Boundary with related skills

- Use `node-build-engineering` for the compile/bundle/emit pipeline itself.
- Use `typescript-package-publishing` (react pack) / repository packaging conventions when the question is the published package's public surface.
- Use `node-repository-forensics` first to map what actually builds and what is generated.
- Use `node-skill-pack-format` only for skill-pack authoring, not application builds.

## Repository inspection

Inspect tsconfig files, build scripts, project references, package exports, bundler/transpiler settings, output directories, source maps, and CI cache strategy. Key questions: which outputs are inputs to other packages (reference graph), which files are generated (and must be excluded or committed deliberately), and where CI caches attach.

## Decision rules

| Concern | Rule |
|---|---|
| Compiler | Prefer the repository's established TypeScript build pipeline. |
| References | Use project references for genuinely separable projects, not arbitrary file splits. |
| Outputs | Align runtime output, declarations, and source maps with package exports. |
| Reproducibility | Build from clean, pinned inputs in CI. |
| Cache | Cache only derived artifacts with keys covering tool/runtime/dependency inputs. |
| Debuggability | Preserve usable source maps without leaking unnecessary source into artifacts. |

- Project references pay off when projects compile at different rates and downstream consumers want declarations without recompiling; they cost off when one file split becomes a pseudo-project.
- Emit the module format the runtime resolves: `type: "module"` packages need ESM output with `.js` extensions in relative imports; bundling for the server should preserve Node resolution semantics unless the pipeline explicitly rewrites them.
- Source maps: `sourceMap: true` plus `inlineSources: false` for artifacts; `sourcesContent` only when the artifact must be debuggable standalone.
- CI cache keys must include the toolchain (TypeScript, Node version, lockfile hash) — a cache restoring artifacts from a different toolchain is a correctness bug, not a speedup.

## Implementation procedure

1. Map the source-to-artifact graph.
2. Identify genuine compilation boundaries.
3. Configure strict and incremental/reference builds where justified.
4. Align outputs with runtime contracts.
5. Add CI artifact/cache validation.
6. Measure before further build optimization.

**Reference example** — a two-package workspace with project references, ESM output aligned to `exports`, and a CI cache key that cannot cross toolchains:

```jsonc
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "outDir": "dist",
    "rootDir": "src",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true                 // required for project references
  },
  "include": ["src"]
}
```

```jsonc
// packages/core/package.json — exports match the emitted shape
{
  "name": "@acme/core",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",   // declaration first
      "default": "./dist/index.js"    // ESM runtime, .js extensions in source imports
    }
  },
  "files": ["dist"]
}
```

```jsonc
// packages/api/tsconfig.json — downstream reference
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src" },
  "references": [{ "path": "../core" }]
}
```

```yaml
# .github/workflows/ci.yml — cache keyed on the full toolchain
- uses: actions/setup-node@v4
  with: { node-version-file: ".nvmrc", cache: "npm" }
- run: npm ci
- run: npx tsc -b --clean && npx tsc -b        # clean build validates the reference graph
- run: npm test
- uses: actions/cache@v4
  with:
    path: "**/dist"
    key: build-${{ runner.os }}-node${{ matrix.node }}-ts${{ hashFiles('package-lock.json') }}-${{ hashFiles('**/src/**/*.ts') }}
```

## Failure modes

- Bundling changes module-resolution semantics: dynamic `require`/`import.meta.resolve`, `__dirname` shims, or `exports` conditions silently resolving differently than in `tsc` output.
- Stale generated files hide compiler errors: `dist/` committed or left in the tree masks a broken graph — clean before typecheck in CI (`tsc -b --clean`).
- A cache restores outputs from a different toolchain — missing Node/TS version in the key.
- Source maps point to missing or private paths — `sourcesContent: false` with `sourceRoot` referencing a build-machine path; consumers see unresolved frames.
- Declaration drift: hand-maintained `.d.ts` diverging from emitted `.d.ts` after `composite` was added.
- Renaming a package's `exports` without rebuilding — CI green on stale `dist` because tests import source directly.

## Agent review checklist

- [ ] Does the artifact shape match `package.json` `exports`/`files` exactly?
- [ ] Is the reference graph real (separate compile rates, declaration consumers) or cosmetic?
- [ ] Can a runtime stack trace in `dist` resolve to source (source map + sources present)?
- [ ] Do cache keys include Node version, TypeScript version, and lockfile hash?
- [ ] Did the CI build run from clean (no restored `dist` before typecheck)?

## Verification

Run clean and incremental builds, type checks, package-content checks, and artifact execution tests. Concretely: (a) `tsc -b --clean && tsc -b` passes; (b) `npm pack` in the built package and install the tarball into a scratch project — imports resolve via `exports`; (c) a deliberately-thrown error from the artifact produces a stack trace resolving to `src/`; (d) deleting the cache and rebuilding yields the same `dist` tree.

## Source foundation

Project references and composite builds: https://www.typescriptlang.org/docs/handbook/project-references.html. Module resolution with `NodeNext` and `exports`: https://www.typescriptlang.org/docs/handbook/modules/theory.html and https://nodejs.org/api/packages.html. Source map options: https://www.typescriptlang.org/tsconfig/#sourceMap. Repository conventions should still be inspected before implementation.
