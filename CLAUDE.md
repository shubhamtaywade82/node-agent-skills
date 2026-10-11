# CLAUDE.md

This file orients Claude Code when working in this repository.

## What this repository is

A portable skill pack for AI coding agents doing Node.js + TypeScript backend work. It is **not** a runnable application — it is a curated corpus of SKILL.md files plus a thin runtime loader and MCP server. There are zero runtime dependencies.

## Operating sequence for changes to this repo

1. Read `AGENTS.md` and `docs/SKILL_CONTRACT.md` before adding or changing any skill.
2. Read `docs/RUNTIME_INTEGRATION.md` to understand how the loader and MCP server consume the manifest.
3. Run `npm test` and `npm run validate` before each commit. Both must pass.
4. The validator enforces: every skill in `skill-manifest.yml` has a matching `skills/<name>/SKILL.md`, every adapter has a matching `adapters/<name>/SKILL.md` + `README.md`, every SKILL.md has the 7 required sections, and no SKILL.md exceeds 500 lines.

## Skill content standard

- Each SKILL.md MUST contain: frontmatter (`name`, `description: Use when ...`) + `## Purpose`, `## Activate when`, `## Repository inspection`, `## Decision rules`, `## Implementation procedure`, `## Failure modes`, `## Verification`.
- Anchor skills (the ones most-routed-to) should be ≥ 100 lines with concrete commands, library names, and ≥ 1 runnable code sample.
- Do not copy-paste `Repository inspection` / `Failure modes` / `Verification` lines verbatim across skills — extract shared guidance into `references/agent-discipline.md` and reference it.

## Runtime files

- `lib/skill-loader.mjs` — zero-dep loader. Exports `routePrompt`, `listSkills`, `listAdapters`, `loadSkillText`, `detectAdapters`.
- `lib/mcp-server.mjs` — MCP server over stdio. Tools: `route_prompt`, `get_skill`, `list_skills`, `list_adapters`.
- `bin/skills.mjs` — CLI wrapper.
- `lib/routing-evaluator.mjs` — deterministic YAML/JSONL routing harness for regression tests.

## Tests

- `npm test` runs `node --test`. All test files live in `test/`.
- The loader and MCP server have their own behavioral tests in `test/skill_loader_contract.test.mjs` and `test/mcp_server_contract.test.mjs`.
- When adding a new skill, also add a routing case to `router/ROUTING_CASES.yml` and an evaluation case to the relevant `evals/cases/<workflow>/workflow.yml`.

## Commit discipline

- Keep commits focused and bisectable.
- Do not include `Co-Authored-By` trailers.
- Run `npm test && npm run validate` before pushing.
