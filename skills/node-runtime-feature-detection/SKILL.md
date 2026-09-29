---
name: node-runtime-feature-detection
description: Use when a feature depends on Node.js, OS, CPU, or execution-environment capabilities.
---

# Runtime Feature Detection

## Purpose

handling Node.js runtime capabilities and platform differences without brittle version assumptions.

## Activate when

- a feature depends on Node.js, OS, CPU, or execution-environment capabilities.
- The change crosses a security, runtime, or repository-quality boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, tests, build, CI, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and existing verification.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

prefer capability checks where possible; minimum engine requirements remain authoritative; fallback behavior is explicit

- Prefer explicit policies and deterministic evidence over defaults.
- Preserve existing contracts unless the task explicitly changes them.
- Keep failure handling bounded, observable, and reversible.

## Implementation procedure

1. Identify capability.\n2. Use documented APIs.\n3. Gate optional behavior.\n4. Test supported and unsupported paths.\n5. Document operational requirements.

## Failure modes

Avoid:

- parsing process.version for every capability; silently using incompatible fallbacks; dead flags masking engine requirements.
- Unbounded retries, output, logging, or resource usage.
- Making security decisions from untrusted metadata alone.

## Verification

1. Add a failing regression or contract test first.
2. Exercise boundary, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Review the diff and residual risk.
5. Report exactly what was verified.
