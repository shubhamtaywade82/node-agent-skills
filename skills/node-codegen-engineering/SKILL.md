---
name: node-codegen-engineering
description: Use when schemas or source metadata generate clients, models, routes, validators, or other code.
---

# Code Generation Engineering

## Purpose

designing code generators that remain deterministic, reviewable, and safe for Node.js/TypeScript projects.

## Activate when

- schemas or source metadata generate clients, models, routes, validators, or other code.
- The change affects code generation, schema contracts, or agent-skill lifecycle.

## Repository inspection

1. Inspect source schemas, generators, manifests, lockfiles, and generated output.
2. Identify authoritative inputs and generated artifact ownership.
3. Inspect CI/release commands and consumer dependencies.
4. Confirm exact tool/runtime versions before applying generator-specific behavior.

## Decision rules

generator inputs are authoritative; generator versions are pinned; output is reproducible and never hand-edited

- Source contracts remain authoritative over generated artifacts.
- Generated output must be reproducible and reviewable.
- Runtime validation remains distinct from compile-time typing.

## Implementation procedure

1. Identify source.\n2. Select generator.\n3. Pin versions.\n4. Define output ownership.\n5. Add generation command.\n6. Run clean regeneration.\n7. Test generated API behavior.

## Failure modes

Avoid:

- generating from runtime state; unpinned generators; generated output drifting between machines.
- Unversioned generation inputs or hidden environment dependencies.
- Manual edits to generated artifacts without an explicit ownership model.

## Verification

1. Add a failing contract/reproducibility test first.
2. Regenerate from a clean environment.
3. Compare generated artifacts and schema diffs.
4. Run the full repository gates.
5. Review the final diff for volatile or unintended output.
