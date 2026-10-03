---
name: node-diagnostic-reports
description: Use when Node.js diagnostic reports are enabled for operational debugging.
---

# Node Diagnostic Reports

## Purpose

collecting diagnostic reports for crashes and severe runtime faults without leaking sensitive data.

## Activate when

- Node.js diagnostic reports are enabled for operational debugging.
- The change affects Node.js runtime, TypeScript build/release, package installation, or protocol behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, workspace configuration, deployment model, and CI.
2. Inspect package metadata, lockfiles, scripts, runtime entrypoints, and security boundaries.
3. Identify authoritative configuration and trust domains.
4. Confirm exact tool versions before using version-specific APIs.

## Decision rules

reports can include environment, stacks, and runtime details; collection/access/retention are controlled

- Supply-chain inputs are production inputs.
- Build and runtime behavior must remain reproducible.
- Diagnostic mechanisms are privileged and must be access-controlled.

## Implementation procedure

1. Define trigger.\n2. Configure safe destination.\n3. Restrict access.\n4. Redact before external export.\n5. Automate collection for fatal conditions.\n6. Test report generation.

## Failure modes

Avoid:

- public report endpoints; retaining reports indefinitely; exporting reports with secrets.
- Treating CI convenience as a substitute for supply-chain or runtime controls.
- Introducing environment-specific behavior without evidence.

## Verification

1. Add a failing contract/regression test first.
2. Reproduce the install/build/runtime scenario in a clean environment.
3. Run focused tests and the full repository gates.
4. Inspect emitted artifacts, cache keys, runtime exposure, and protocol behavior.
5. Report exact evidence and remaining risks.
