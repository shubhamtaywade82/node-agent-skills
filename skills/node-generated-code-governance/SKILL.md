---
name: node-generated-code-governance
description: Use when OpenAPI/protobuf/GraphQL/ORM or codegen output is committed or built.
---

# Generated Code Governance

## Purpose

keeping generated TypeScript/API/client/schema code reproducible, reviewable, and aligned with its source.

## Activate when

- OpenAPI/protobuf/GraphQL/ORM or codegen output is committed or built.
- The change affects persistence performance, service lifecycle, configuration correctness, or generated artifacts.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, database/client, deployment model, and test commands.
2. Locate the authoritative source of the behavior and its current operational metrics.
3. Inspect migrations, query plans, connection lifecycle, health probes, configuration sources, and generators.
4. Confirm exact dependency/tool versions before using adapter-specific commands.

## Decision rules

source schema/template is authoritative; generated output is reproducible; generators are version-pinned; manual edits to generated files are prohibited or explicit

- Optimize from measurements, not intuition.
- Keep transactions, connections, probes, and generated work bounded and deterministic.
- Never leak secrets through diagnostics or drift checks.
- Preserve existing data and API invariants during performance and lifecycle changes.

## Implementation procedure

1. Identify generator/source.
2. Pin generator version.
3. Define generation command.
4. Verify clean regeneration in CI.
5. Review generated diff.
6. Manage breaking source changes.

## Failure modes

Avoid:

- editing generated code manually; unpinned generators; generated output that differs by machine; treating codegen as a hidden build side effect.
- Hiding performance or correctness problems behind larger resource budgets.
- Introducing operational behavior that cannot be tested or rolled back.

## Verification

1. Add focused regression/concurrency/contract coverage first.
2. Reproduce the measured behavior with representative inputs.
3. Run tests, build/typecheck, and applicable migration/generation checks.
4. Verify resource cleanup, lifecycle semantics, and operational telemetry.
5. Inspect the final diff for unintended generated/configuration changes.
