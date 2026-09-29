---
name: node-security-regression-testing
description: Use when a vulnerability or abuse case has been identified or a security boundary changed.
---

# Security Regression Testing

## Purpose

turning discovered security defects into permanent tests.

## Activate when

- a vulnerability or abuse case has been identified or a security boundary changed.
- The change crosses a security, runtime, or repository-quality boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, tests, build, CI, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and existing verification.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

tests reproduce the exploit at the narrowest boundary and remain independent of implementation details

- Prefer explicit policies and deterministic evidence over defaults.
- Preserve existing contracts unless the task explicitly changes them.
- Keep failure handling bounded, observable, and reversible.

## Implementation procedure

1. Write reproduction first.\n2. Assert exploit is blocked.\n3. Test nearby variants.\n4. Add CI coverage.\n5. Document affected boundary.\n6. Verify no unsafe fixture leaks secrets.

## Failure modes

Avoid:

- testing only one string variant; disabling the regression test later; using real credentials or production data.
- Unbounded retries, output, logging, or resource usage.
- Making security decisions from untrusted metadata alone.

## Verification

1. Add a failing regression or contract test first.
2. Exercise boundary, failure, and abuse cases.
3. Run focused tests and full repository gates.
4. Review the diff and residual risk.
5. Report exactly what was verified.
