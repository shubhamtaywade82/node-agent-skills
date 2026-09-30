---
name: node-agent-evaluation
description: Use when the skill pack, router, prompts, or agent workflow needs regression evaluation.
---

# Agent Evaluation

## Purpose

building deterministic evaluation cases that measure AI coding-agent behavior.

## Activate when

- the skill pack, router, prompts, or agent workflow needs regression evaluation.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

evaluate behavior and invariants, not prose style; include adversarial pressure; keep fixtures deterministic; never weaken validators to improve scores

- For routing evaluation, use `npm run eval:routing -- --decisions <jsonl>` and treat its machine-readable failure codes as the source of truth.
- Require strict corpus metadata validation for evaluation workflows; missing prompt, routing-signal, evidence, disambiguation, or invariant metadata is a corpus defect, not a scoring adjustment.
- Track primary accuracy, adapter accuracy, and secondary violation rate separately so a good primary route cannot hide adapter or secondary-selection regressions.

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define target behavior.
2. Create failing and edge cases.
3. Assert architectural invariants and verification steps.
4. Include repository-context pressure.
5. Record expected evidence.
6. Run the regression set after changes.
7. For routing changes, submit one JSONL routing decision per evaluation case and fail closed on missing, extra, malformed, or incompatible selections.

## Failure modes

Avoid:

- golden answers copied verbatim; string-only tests; flaky environment dependencies; relaxing checks after failures.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
