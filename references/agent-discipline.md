# Agent Discipline (shared reference)

Shared guidance referenced by multiple skills in `skills/`. Extracted here so a single wording fix does not require editing 18+ skill files. SKILL.md files include a pointer line `See references/agent-discipline.md for the shared lines.` rather than duplicating the text.

## Shared Repository inspection lines

The following sequence appears in 18+ skills when the skill's domain is so specific that the repository inspection step is dominated by generic concerns (package manager, Node version, neighboring tests):

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.
4. Detect exact dependency versions before using version-specific APIs.
5. Treat external input and resource state as untrusted runtime data.
6. Preserve existing contracts unless the task explicitly changes them.

Skills that include only these generic inspection steps should reference this file rather than re-stating them. Skills with domain-specific inspection steps (e.g., `node-postgresql-persistence` lists migrations, constraints, indexes, query plans) keep their own steps and do not reference this file.

## Shared Decision rules

When a skill's decision rules are dominated by generic concerns rather than domain-specific ones, the following apply:

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Shared Failure modes

Generic failure modes that apply to any skill:

- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.
- Skipping verification when time pressure mounts.
- Inferring repository state from a task description rather than inspecting.

Domain-specific failure modes (e.g., "long transaction holding a lock across an HTTP call" for `node-postgresql-persistence`) belong in the skill, not here.

## Shared Verification

The shared verification sequence applies when a skill has no domain-specific verification steps:

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

Skills with domain-specific verification (e.g., `EXPLAIN ANALYZE` for SQL, `wrangler dev` for Workers) keep their own steps and do not reference this file.

## When to reference this file

A SKILL.md should reference this file when its `## Repository inspection`, `## Decision rules`, `## Failure modes`, or `## Verification` section would otherwise be boilerplate. The reference line is:

```
See references/agent-discipline.md for the shared lines.
```

When a SKILL.md references this file, it must still include at least one domain-specific item in each section so the skill is not pure boilerplate.

## When NOT to reference this file

- Anchor skills (the 14 most-routed skills fleshed out in Wave 18) keep their own concrete grep targets, library names, and verification commands. They do not reference this file.
- Adapter SKILL.md files always keep their own adapter-specific content.
- Skills with a `version` field ≥ 0.2.0 have likely been deepened past the boilerplate stage; do not regress them by replacing concrete content with a reference.
