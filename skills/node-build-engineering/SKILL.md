---
name: node-build-engineering
description: Use when designing TypeScript compilation, project references, bundling, source maps, build caching, artifact generation, or multi-package Node.js build pipelines.
---

# Build Engineering

## Purpose
Make TypeScript builds deterministic, debuggable, and aligned with package/runtime boundaries.

## Activate when
- A repository has multiple TypeScript projects or packages.
- Build time, memory, or output correctness is a problem.
- Shipping compiled Node.js artifacts.

## Repository inspection
Inspect tsconfig files, build scripts, project references, package exports, bundler/transpiler settings, output directories, source maps, and CI cache strategy.

## Decision rules
| Concern | Rule |
|---|---|
| Compiler | Prefer the repository's established TypeScript build pipeline. |
| References | Use project references for genuinely separable projects, not arbitrary file splits. |
| Outputs | Align runtime output, declarations, and source maps with package exports. |
| Reproducibility | Build from clean, pinned inputs in CI. |
| Cache | Cache only derived artifacts with keys covering tool/runtime/dependency inputs. |
| Debuggability | Preserve usable source maps without leaking unnecessary source into artifacts. |

## Implementation procedure
1. Map the source-to-artifact graph.
2. Identify genuine compilation boundaries.
3. Configure strict and incremental/reference builds where justified.
4. Align outputs with runtime contracts.
5. Add CI artifact/cache validation.
6. Measure before further build optimization.

## Failure modes
- Bundling changes module-resolution semantics.
- Stale generated files hide compiler errors.
- A cache restores outputs from a different toolchain.
- Source maps point to missing or private paths.

## Verification
Run clean and incremental builds, type checks, package-content checks, and artifact execution tests.