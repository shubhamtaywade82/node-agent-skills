# Skill Contract

Every shipped `SKILL.md` must contain:

- YAML frontmatter with `name` and a `description` beginning with `Use when`.
- `## Purpose` explaining the reusable engineering problem.
- `## Activate when` with concrete triggers.
- `## Repository inspection` identifying evidence to inspect before changing code.
- `## Decision rules` stating enforceable engineering choices.
- `## Implementation procedure` with a bounded workflow.
- `## Failure modes` describing likely agent mistakes.
- `## Verification` defining observable proof.

Skills should remain under 500 lines. Put deep, stable reference material in a skill-local `references/` directory one level below the skill when needed. Create a new skill only when the capability is a separate routing boundary.

## Trigger quality

Descriptions must be searchable by problem, symptom, technology, or artifact terms. Do not make descriptions generic summaries of the skill body.

## Verification quality

Structural validation is necessary but insufficient. Future iterations must add behavioral pressure tests that demonstrate agents apply the guidance under time, ambiguity, and failure pressure.
