# Runtime integration

This document explains how an AI coding agent runtime (Claude Code, Cursor, Cline, Continue, or any MCP-aware client) consumes the skills in this pack at runtime.

## Pack shape

- `skill-manifest.yml` — registry of 340 skills (name, category, triggers; v3 fields on cross-pack-aware entries) and 95 adapters (path, version_scope, source). Declares `schema_version: 3`, a `pack:` envelope, and a `cross_pack:` section (companions, name collisions, seam contracts) — see `docs/CROSS_PACK_SCHEMA.md`.
- `skills/<name>/SKILL.md` — framework-neutral skill entrypoint. Each follows the contract in `docs/SKILL_CONTRACT.md`.
- `adapters/<name>/SKILL.md` — framework/library translation layer. Loaded only after the runtime detects the package in the target repo.
- `router/ROUTING_CASES.yml` — primary→secondary routing table.
- `router/ROUTING.md` — human-readable routing map, including the "Node and Ruby cross-stack routing" section.
- `lib/skill-loader.mjs` — zero-dependency runtime loader. Exports `routePrompt`, `listSkills`, `listAdapters`, `loadSkillText`, `detectAdapters`, `resolveSecondaries`. v3: `routePrompt` accepts `activeFile`/`language` options; `parseManifest` also returns the pack envelope and `cross_pack` section.
- `lib/cross-pack-manifest.mjs` — v3 shared parsers (both manifest entry forms, cross_pack section, snapshots, language maps).
- `lib/cross-pack-router.mjs` — v3 cross-pack router (`routeCrossPack`).
- `lib/v3-schema.mjs` — v3 manifest structural validator.
- `lib/mcp-server.mjs` — zero-dependency MCP server (JSON-RPC 2.0 over stdio).
- `bin/skills.mjs` — CLI wrapper around the loader (`route`, `cross-route`, `list`, `adapters`, `show`, `detect-repo`, `version`).
- `bin/cross-pack-verify.mjs` — v3 cross-pack contract verifier.
- `lib/routing-evaluator.mjs` — deterministic routing-accuracy harness for regression testing.

## Three integration paths

### Path 1 — MCP server (recommended for Claude Code, Cursor, Cline)

Add the server to the agent's MCP configuration (`.cursor/mcp.json`, `~/.claude/mcp.json`, or the client's equivalent):

```json
{
  "mcpServers": {
    "node-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/node-agent-skills/lib/mcp-server.mjs"],
      "env": {
        "NODE_AGENT_SKILLS_ROOT": "/absolute/path/to/node-agent-skills",
        "AGENT_SKILLS_PACKS": "/absolute/path/to/ruby-agent-skills"
      }
    }
  }
}
```

`NODE_AGENT_SKILLS_ROOT` overrides the pack root (default: the server script's parent directory). `AGENT_SKILLS_PACKS` lists companion pack roots for cross-pack routing (sibling directories named after declared companions are discovered automatically).

The server exposes five tools:

| Tool | Input | Returns |
|---|---|---|
| `route_prompt` | `{prompt, repo?, file?}` | `{active_language, primary, secondary, candidates, adapters}` — `file` enables v3 language-aware boosting (matching skills x2, non-matching x0.5) |
| `route_cross_pack` | `{prompt, file?, packs?}` | `{active_language, packs[], primary, candidates, seam, companion_owners}` — routes across this pack AND installed companions (v3) |
| `get_skill` | `{name}` | SKILL.md text |
| `list_skills` | `{category?}` | manifest slice (v3 fields included) |
| `list_adapters` | `{}` | adapter registry |

Agent workflow:
1. Receive task → call `route_prompt` with the task description and target repo path (pass the active file as `file` for language-aware boosting).
2. For a task that may cross a language boundary (Node + Rails), call `route_cross_pack`; when the returned `seam.recommended` is true, load BOTH `seam.this_pack_seam` and `seam.companion_side`.
3. For each returned `primary` + `secondary` skill name, call `get_skill`.
4. For each returned adapter, call `get_skill` on the adapter path (returned `adapters[].path`).
5. Apply the loaded SKILL.md procedures to the change.

### Path 2 — CLI (for scripted or non-MCP environments)

```bash
# Route a prompt to a primary skill + secondaries + adapters detected in repo
node bin/skills.mjs route "add a Postgres transaction with an index" --repo ./my-repo

# Route with language awareness: --file boosts skills matching the file's language (v3)
node bin/skills.mjs route "add a migration" --file src/order.ts

# Route across this pack AND companion packs (v3)
node bin/skills.mjs cross-route "the Node BFF calls the Rails orders API" --file src/bff.ts
node bin/skills.mjs cross-route "add a migration" --packs /path/to/ruby-agent-skills

# List all skills, optionally filtered by category
node bin/skills.mjs list --category persistence

# Print a skill's SKILL.md content
node bin/skills.mjs show node-postgresql-persistence

# Detect adapters present in a target repo
node bin/skills.mjs detect-repo ./my-repo
```

### Path 3 — programmatic import (for agent frameworks built on Node)

```js
import { routePrompt, loadSkillText } from "node-agent-skills/lib/skill-loader.mjs";

const routing = await routePrompt("add a Postgres transaction", "/abs/path/to/repo");
console.log(routing.primary, routing.secondary, routing.adapters);
const skillText = await loadSkillText(routing.primary);
```

## Routing model

1. The loader tokenizes the prompt and scores each skill by trigger overlap.
2. The top-scoring skill becomes the `primary`.
3. `secondary` skills are resolved from `router/ROUTING_CASES.yml` for that primary.
4. `adapters` are detected by reading `dependencies`/`devDependencies`/`peerDependencies`/`optionalDependencies` of `<repoPath>/package.json` and matching against the adapter registry.
5. (v3) When an active file or language is provided, matching-language skills are boosted (x2) and non-matching skills demoted (x0.5); when routing cross-pack, the same rule applies per pack and the seam contract is recommended for cross-stack tasks.

Scoring is deliberately simple (token overlap + v3 language adjustment) so the routing decision is explainable and deterministic. For higher-stakes routing, use the deterministic evaluator (`npm run eval:routing`) against your own decision JSONL.

## Agent contract

An agent using this pack MUST:

1. Call `route_prompt` with both the task prompt and the absolute repo path. Skipping the repo path disables adapter detection.
2. Load the primary SKILL.md before editing. Apply its `Repository inspection`, `Decision rules`, and `Implementation procedure` sections.
3. Load secondary SKILL.md files only when their boundary is implicated by the change.
4. Load adapter SKILL.md files only when the corresponding package is detected in the target repo's `package.json`.
5. Verify with the skill's `Verification` section plus the repository's own gates (`npm test`, `npm run validate`, typecheck, lint).
6. Report evidence as specified in `AGENTS.md` — observed facts only, no inferred state.

## Why zero dependencies

The pack stays at zero runtime dependencies so:
- Installation is `git clone` + `node bin/skills.mjs` — no `npm install` step.
- The MCP server can be embedded in any agent runtime without supply-chain concerns.
- CI is reproducible across Node patch releases (the only constraint is `engines.node: ">=24"`).

## Verification of the runtime itself

```bash
npm test
npm run validate
node bin/skills.mjs route "add a websocket endpoint with auth" --repo .
```

The test suite covers both the routing evaluator (deterministic YAML/JSONL harness) and the skill loader (prompt routing + adapter detection).
