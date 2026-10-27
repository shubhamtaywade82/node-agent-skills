# CLAUDE.md

This file orients Claude Code when working in this repository.

## What this repository is

A portable skill pack for AI coding agents doing Node.js + TypeScript backend work. It is **not** a runnable application — it is a curated corpus of SKILL.md files plus a thin runtime loader and MCP server. There are zero runtime dependencies.

## Read these before making non-trivial changes

In this order:

1. **`AGENTS.md`** — the canonical engineering contract. The Operating sequence, Node + TypeScript rules, Skill contract, Companion packs, and Framework strategy sections are binding for any agent working in this pack.
2. **`docs/CROSS_PACK_SCHEMA.md`** — the v3 cross-pack manifest schema that this pack and `ruby-agent-skills` both speak. Read this before adding or changing any `cross_pack:` entry.
3. **`docs/CLAUDE_CODE_INTEGRATION.md`** — how to install and wire this pack into Claude Code (`~/.claude/skills/`, `~/.claude/CLAUDE.md`, `~/.claude/mcp.json`, `/skills` slash command).
4. **`docs/SKILL_CONTRACT.md`** — the frontmatter + 7-section template + 500-line cap for every `SKILL.md`.
5. **`docs/RUNTIME_INTEGRATION.md`** — how the loader and MCP server consume the manifest.
6. **`router/ROUTING.md`** — the cross-stack routing matrix; especially the "Node and React cross-stack routing" section (existing) and "Node and Ruby cross-stack routing" section (v3 addition).

This file is a Claude Code pointer. The canonical contract lives in `AGENTS.md`. To bind a project to the contract, drop a `./CLAUDE.md` in the project root with:

```markdown
@import ./path/to/node-agent-skills/AGENTS.md
```

## Operating sequence for changes to this repo

1. Read `AGENTS.md` and `docs/SKILL_CONTRACT.md` before adding or changing any skill.
2. Read `docs/RUNTIME_INTEGRATION.md` to understand how the loader and MCP server consume the manifest.
3. Run `npm test` and `npm run validate` before each commit. Both must pass.
4. The validator enforces: every skill in `skill-manifest.yml` has a matching `skills/<name>/SKILL.md`, every adapter has a matching `adapters/<name>/SKILL.md` + `README.md`, every SKILL.md has the 7 required sections, and no SKILL.md exceeds 500 lines.
5. After changing `skill-manifest.yml`, also run `node bin/cross-pack-verify.mjs` (v3 addition) to verify the `cross_pack:` section is well-formed, collision-free, and structurally valid per `lib/v3-schema.mjs`.

## Skill content standard

- Each SKILL.md MUST contain: frontmatter (`name`, `description: Use when ...`) + `## Purpose`, `## Activate when`, `## Repository inspection`, `## Decision rules`, `## Implementation procedure`, `## Failure modes`, `## Verification`.
- Anchor skills (the ones most-routed-to) should be ≥ 100 lines with concrete commands, library names, and ≥ 1 runnable code sample.
- Do not copy-paste `Repository inspection` / `Failure modes` / `Verification` lines verbatim across skills — extract shared guidance into `references/agent-discipline.md` and reference it.

## Runtime files

- `lib/skill-loader.mjs` — zero-dep loader. Exports `routePrompt`, `listSkills`, `listAdapters`, `loadSkillText`, `detectAdapters`. v3-aware: reads `NODE_AGENT_SKILLS_ROOT` env var (default: script-relative `..`, unchanged); `parseManifest` returns the pack envelope, `schema_version`, and the `cross_pack` section in addition to skills/adapters; per-skill v3 fields (`path`, `family`, `language`, `version`, `compatibility`, `schema_version`, `companion_owners`) are populated when present; `routePrompt` accepts `activeFile`/`language` options for language-aware scoring (matching skills x2, non-matching x0.5).
- `lib/cross-pack-manifest.mjs` — **v3 addition.** Shared parsers: pack envelope, scoped skill entries (both mapping and sequence manifest forms), `cross_pack:` section, companion snapshots, plus the language maps and scoring helpers.
- `lib/cross-pack-router.mjs` — **v3 addition.** `routeCrossPack(prompt, {packs, file, language})` routes a prompt across this pack AND companion packs (discovered from `packs`, the `AGENT_SKILLS_PACKS` env var, or sibling directories), with language boosting, seam-contract recommendation, and companion-owner surfacing.
- `lib/v3-schema.mjs` — **v3 addition.** Zero-dep structural validator for the v3 manifest schema (used by `bin/cross-pack-verify.mjs` and importable directly).
- `lib/mcp-server.mjs` — MCP server over stdio. Tools: `route_prompt` (with optional `file` for language boosting), `route_cross_pack`, `get_skill`, `list_skills`, `list_adapters`. Honors `NODE_AGENT_SKILLS_ROOT` and `AGENT_SKILLS_PACKS` env vars.
- `bin/skills.mjs` — CLI wrapper. Commands: `route` (with `--file`), `cross-route` (with `--packs`/`--file`), `list`, `adapters`, `show`, `detect-repo`, `version`.
- `bin/cross-pack-verify.mjs` — **v3 addition.** Verifies the `cross_pack:` section of `skill-manifest.yml` (via `lib/v3-schema.mjs` + shared parsers): schema_version marker, pack envelope, per-skill v3 field shapes, companion snapshots (existence + freshness + collision-registry accuracy), and seam_contract existence. Run after `npm run validate` for full coverage.
- `lib/routing-evaluator.mjs` — deterministic YAML/JSONL routing harness for regression tests.

## Tests

- `npm test` runs `node --test`. All test files live in `test/`.
- The loader and MCP server have their own behavioral tests in `test/skill_loader_contract.test.mjs` and `test/mcp_server_contract.test.mjs`.
- When adding a new skill, also add a routing case to `router/ROUTING_CASES.yml` and an evaluation case to the relevant `evals/cases/<workflow>/workflow.yml`.
- When adding a new companion pack, also add an entry to `cross_pack.companions[]` in `skill-manifest.yml` and a snapshot file at `data/cross-pack/<companion>.snapshot.yml`.

## Cross-pack integration (binding)

This pack declares two companion packs in `skill-manifest.yml`'s `cross_pack:` section:

| Companion | Boundary | This pack's seam skill | Companion's seam skill |
|---|---|---|---|
| `ruby-agent-skills` | Node ↔ Ruby backend | `node-ruby-integration` | `rails-node-integration` |
| `react-agent-skills` | Node ↔ React client | `node-react-integration` | `browser-authentication` |

**Claude Code routing rule**: when a task touches a Node + Rails boundary, load both seam skills (this pack's `node-ruby-integration` and the companion's `rails-node-integration`) plus the owning domain skills on each side. When only this pack is installed, do the Node side and the seam, then report the Rails-side follow-up with the owning companion skill (`rails-node-integration` for the seam, `rails-action-controller` / `rails-active-record` for the domain). **Never improvise Rails guidance from this pack.**

`node-agent-skills` and `ruby-agent-skills` share **zero** name collisions today (this pack prefixes every skill with `node-`); see `data/cross-pack/ruby-agent-skills.snapshot.yml`. `node-agent-skills` and `react-agent-skills` also share zero collisions today.

## Commit discipline

- Keep commits focused and bisectable.
- Do not include `Co-Authored-By` trailers.
- Run `npm test && npm run validate` before pushing.
- After changing `skill-manifest.yml`'s `cross_pack:` section, run `node bin/cross-pack-verify.mjs` before pushing.
