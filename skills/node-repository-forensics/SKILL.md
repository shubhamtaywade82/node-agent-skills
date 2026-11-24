---
name: node-repository-forensics
description: Use when you need to understand structure, runtime entrypoints, package boundaries, build/test commands, or deployment assumptions.
license: MIT
---

# Repository Forensics

## Purpose

Map an unfamiliar Node.js/TypeScript repository before changing it. The discipline: treat the repository as evidence, not as a guess. Checked-in files, lockfiles, CI, and package metadata are facts; architecture inferred from folder names is hypothesis until a test or an import proves it.

## Activate when

- you need to understand structure, runtime entrypoints, package boundaries, build/test commands, or deployment assumptions.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Boundary with related skills

- Use `node-repository-forensics` to establish the map before any change.
- Use `frontend-repository-archetypes` (react pack) for browser-repo classification; this skill classifies Node backends and workspaces.
- Use `node-build-engineering` when the map reveals a build/packaging problem.
- Use `node-repository-health` for drift/dependency-decay assessment rather than first-contact mapping.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

The evidence ladder, most to least authoritative:

| Rank | Evidence | What it proves |
|---|---|---|
| 1 | Runtime behavior / tests | What the code actually does |
| 2 | `package.json` scripts + CI config | How it is actually built/tested/deployed |
| 3 | Lockfile + `engines`/`.nvmrc` | The toolchain it actually runs on |
| 4 | tsconfig / eslint config | The contracts the compiler enforces |
| 5 | Source layout + exports maps | Intended module boundaries |
| 6 | README / docs / comments | Intended design — verify against ranks 1–5 |

## Decision rules

- Treat checked-in files, lockfiles, CI, and package metadata as evidence; separate facts from hypotheses; preserve generated/configured boundaries.
- Entrypoints come from `package.json` (`main`, `module`, `exports`, `bin`) plus process managers (PM2, systemd, Docker `CMD`) — never from a file that merely looks like a server.
- One repository can contain multiple deployables (API, worker, CLI); enumerate them from `bin/`, workspace globs, and CI job matrices before assuming a single service.
- Generated directories (`dist/`, `coverage/`, generated clients) are boundaries: read to understand output, never edit by hand; check for `files` entries and `.gitignore` to confirm their status.
- The lockfile, not the manifest, is the dependency truth: `npm ls <pkg>` / `yarn why` / `pnpm why` resolve the actually-installed version.

## Implementation procedure

1. Inventory package manager and workspaces.
2. Identify entrypoints.
3. Map scripts and CI.
4. Trace dependency direction.
5. Locate tests/config.
6. Record conventions.
7. Only then edit.

**Reference example** — a forensic pass over an unfamiliar repo, as a repeatable procedure with outputs:

```bash
# 1. Package manager + toolchain (lockfile present + engines pin the truth)
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
cat .nvmrc 2>/dev/null; node -e "console.log(require('./package.json').engines)"

# 2. Deployables: exports/bin/workspaces — this repo is NOT one service
node -e "const p=require('./package.json'); console.log(JSON.stringify(
  { workspaces: p.workspaces, bin: p.bin, exports: Object.keys(p.exports||{}) }, null, 1))"

# 3. What CI actually runs (the real build/test/deploy contract)
rg -l "runs-on|jobs:" .github/workflows/ 2>/dev/null && cat .github/workflows/*.yml | rg "run:"

# 4. Who owns the behavior: importers of the module I am about to change
rg -l "from ['\"].*orders" --type ts packages/ | sort

# 5. Entry evidence: what actually starts (docker CMD / pm2 / server bootstrap)
rg "CMD|pm2|createServer|listen\(" Dockerfile* ecosystem.config.* src/ -l 2>/dev/null

# 6. Generated boundaries: what NOT to hand-edit
cat .gitignore | rg "dist|generated|coverage"
node -e "console.log(require('./package.json').files ?? '(no files field — full tree ships)')"
```

Findings record (keep in the task notes, facts before hypotheses):

```md
## Forensic map — repo X @ <commit>
- Toolchain: npm 10, Node >=20 (.nvmrc: 20.11), TS 5.5 strict
- Deployables: 3 — packages/api (exports "."), packages/worker (bin/worker),
  packages/cli (bin/acme). NOT a single service.
- CI truth: lint → tsc -b → test → docker build (api only; worker/CLI ship to npm)
- Owner of orders module: packages/api/src/orders (3 importers, all in api)
- Generated: packages/api/src/generated/client (gitignored; do not edit)
- Hypothesis (verify): worker consumes the same queue contract as api
  — confirmed via packages/worker/src/queue.ts importing @acme/core
```

## Failure modes

Avoid:

- Guessing architecture from directory names (`src/services` is a label, not a boundary).
- Editing generated output (client, ORM, protobuf) that a build step overwrites.
- Overlooking alternate packages: the monorepo ships three deployables; changing shared code with only the API running in tests.
- Relying on stale README claims — the README says "MySQL" but the lockfile and config say Postgres.
- Treating the manifest as dependency truth: the lockfile pins a different major than `^` ranges suggest.
- Assuming the test script covers all packages: `npm test` at the root may only run one workspace's suite.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

A forensic pass is verified when the map predicted the gates: the commands recorded in step 3 of the procedure are the ones that actually run in CI, and the deployables identified in step 2 are the ones the deployment actually ships.

## See also

See `references/agent-discipline.md` for the shared lines that were removed from the verification section.
