# Node Agent Skills Engineering Contract

This repository is an agent-oriented Node.js + TypeScript backend skill system. Skills, manifest, routing, validators, evaluations, tests, and release metadata are one consistency surface. Every coding agent working here must treat the skill library, adapters, evaluation corpus, and validators as one system.

## Domain change contracts

Framework- and domain-specific rules (HTTP engineering, authentication, authorization, database, queues, messaging, resilience, security, observability, and the rest) live in the owning skill, so they load only when that skill is routed. Route with `skill-manifest.yml` and `router/ROUTING.md`, then apply the owning skill's change contract in full. Keep authentication and authorization separate at every boundary: identity establishment never proves permission, and cross-boundary authorization re-authorizes at the execution boundary instead of inheriting trust from an earlier request or hop.

## Operating sequence

1. **Discover** the applicable skill from `skill-manifest.yml` and `router/ROUTING.md`.
2. **Inspect** runtime, dependencies, architecture, public contracts, tests, and local conventions before proposing a design.
3. **Resolve ambiguity** before changing behavior. Do not silently choose between conflicting requirements.
4. **Apply the smallest architecture** that satisfies the contract.
5. **Write or update the owning test** before implementation when behavior changes.
6. **Implement incrementally** and verify at the boundary that owns the contract.
7. **Treat external data as untrusted** and async work as failure-prone.
8. **Lint and typecheck the change** with the repository's configured tooling when TypeScript code is affected.
9. **Run security verification** for security-sensitive changes, using the configured scanners and abuse-case tests.
10. **Review** security, concurrency, persistence integrity, observability, performance, and compatibility when implicated.
11. **Verify** with the repository's validators (`node scripts/validate.mjs`), focused tests, and applicable CI-equivalent checks.
12. **Report observed evidence only.** Never claim a test, benchmark, CI run, or deployment passed unless it was actually observed.

## Node + TypeScript rules

- Resolve Node version from repository configuration (`engines`, `.nvmrc`, CI matrix), not from memory.
- Treat ESM/CommonJS behavior as a runtime contract; verify from the nearest `package.json` `type` field and export maps.
- Prefer strict TypeScript and explicit public boundaries.
- Use `unknown` at untrusted boundaries; types do not validate JSON.
- Bound concurrency for data-dependent async work.
- Make timeout, cancellation, retry, and idempotency semantics explicit.
- Enforce critical persistence invariants in the database.
- Authentication establishes identity; authorization establishes permission.
- Never log credentials, tokens, or sensitive payloads.

## Context rules

- Read only the smallest useful source slice first; expand context when evidence requires it.
- Prefer official/source-backed guidance for framework-sensitive behavior; resolve version-specific mechanics from the installed dependency, not from training memory.
- Treat security scanner output as evidence requiring trust-boundary and data-flow analysis, not as an automatic verdict.
- Treat external input and third-party responses as untrusted at boundaries.
- Never weaken a validator or test merely to make an agent run green.
- Preserve public contracts unless the task explicitly changes them.

## Routing quality

- Treat trigger matching as an activation signal, not proof that a skill owns the task.
- Identify a primary skill from the dominant engineering boundary.
- Add secondary skills only for real dependent constraints or execution boundaries.
- Consult `router/ROUTING.md` for overlap-heavy tasks; prefer composing existing skills over creating a new skill for every cross-cutting concern.
- Keep authentication and authorization separate; identity establishment does not prove permission.
- Adapter skills (`adapter_skills:` in the manifest) apply only when the named framework/ORM/queue is actually in the repository's dependency tree.

## Design rules

- Prefer the simplest implementation satisfying the contract.
- Reuse an existing repository abstraction before introducing a new one.
- Introduce services, strategies, adapters, policies, or other patterns only when the responsibility or variation justifies the boundary.
- Keep domain behavior out of transport layers when it does not belong there.
- Keep persistence integrity in database constraints where application validation alone cannot guarantee it.
- Do not create abstractions solely to satisfy a pattern vocabulary.
- Prefer the smallest coherent diff, not the smallest textual diff; preserve security, boundary validation, database integrity, observability, and required tests.

## Skill contract

Every `SKILL.md` must contain valid name/description frontmatter, a precise trigger, repository inspection, decision rules, implementation procedure, failure modes, and verification. Keep skills focused and below 500 lines (~5,000 estimated tokens); move deep knowledge into skill-local `references/` one level deep, never into a new skill unless it is a separate routing boundary.

## Verification contract

A change is complete only when:

- relevant tests pass;
- validators pass;
- no accidental scope expansion is present;
- public contracts are preserved or intentionally updated;
- unrun checks are explicitly disclosed.

## Skill precedence

When multiple skills apply:

1. explicit task requirements;
2. repository architecture and existing conventions;
3. runtime/framework constraints;
4. focused domain skill;
5. design-pattern guidance;
6. generic style preferences.

When skills conflict, stop and resolve the conflict rather than combining incompatible rules.

## Companion packs

React/TypeScript client work belongs to `react-agent-skills`; never copy its skills here. For a Node + React change, follow `router/ROUTING.md` "Node and React cross-stack routing": this pack owns the server and the seam (`node-react-integration`), react-agent-skills owns the client (its symmetric seam is `react-node-integration`). If react-agent-skills is not installed, report the client follow-up and its owning skill instead of improvising.

Ruby/Rails backend work belongs to `ruby-agent-skills`; never copy its skills here. For a Node + Rails change, follow `router/ROUTING.md` "Node and Ruby cross-stack routing": this pack owns the Node side and the seam (`node-ruby-integration`), ruby-agent-skills owns the Rails side (its symmetric seam is `rails-node-integration`). If ruby-agent-skills is not installed, report the Rails-side follow-up and its owning skill (`rails-node-integration` for the seam; `rails-action-controller` / `rails-active-record` / etc. for the domain) instead of improvising.

The `cross_pack:` section of `skill-manifest.yml` declares the pinned companion snapshot; `bin/cross-pack-verify.mjs` checks that each seam is symmetric and that the collision registry matches the actual name intersection. Run it before merging any cross-pack change.

## Skill-pack installation

- Treat installed skills as executable agent configuration.
- Review the requested repository/ref before installation and prefer immutable tags or commits for reproducible environments.
- Verify the installed pack with `bin/skills.mjs verify` before using it in a controlled benchmark.
- Do not mix skill packs from different revisions when collecting benchmark evidence; record the resolved Git SHA and manifest/routing hashes.
- Remove or replace obsolete skills through the installer (`bin/install`) rather than manually mutating the installation tree.

## Benchmark integrity

Evaluation fixtures and verifiers are measurement infrastructure. Do not make the evaluator easier by weakening constraints, accepting unverified output, or coupling the verifier to one agent's implementation. Public structural checks must be complemented by behavioral tests and, where appropriate, hidden/adversarial cases.

- Keep evaluation cases deterministic, source-traceable, and independent from one another.
- Treat baseline versus skills-enabled comparisons as controlled paired experiments with identical runtime, fixture, verifier, and agent configuration, unless a deliberate provider comparison is being run.
- Require fresh workspaces for paired runs and preserve individual run evidence rather than reducing results to one score.
- Never interpret benchmark smoke tests as evidence of model capability improvement; smoke tests establish harness integrity only.
- Never weaken an evaluator, fixture, or verifier to make an agent pass.

## CI toolchain maintenance

For GitHub Actions and toolchain changes:

- inspect the currently supported action runtime/version before changing a workflow;
- keep Node versions in CI aligned with the `engines` field and the documented support policy;
- run `node scripts/validate.mjs` and the full test suite before pushing workflow changes;
- do not treat a green workflow with deprecation warnings as a finished maintenance state when the warning has an actionable supported upgrade.

## Release and public-readiness changes

For final release or publication changes:

- keep README inventory, CHANGELOG, manifest, router, validators, and CI evidence synchronized;
- record each change through a changeset (`.changeset/`) and release via the changeset flow, never in the README;
- require explicit public contribution and security entry points (`CONTRIBUTING.md`, `SECURITY.md`) without inventing unsupported contact channels;
- keep changelog entries factual and scoped to repository changes actually implemented;
- do not commit generated benchmark outputs, credentials, local paths, or provider-specific secrets;
- run the full validator suite and the canonical validator before calling the repository publication-ready.

## Evaluation and benchmark changes

For evaluation or benchmark changes:

- distinguish the public evaluation corpus from benchmark-measured fixture/campaign coverage;
- validate fixture roots and implementation/test seams before treating a campaign as executable;
- preserve campaign version, source corpus, fixture/verifier identity, execution controls, and coverage provenance in aggregate results;
- keep hidden/adversarial benchmark cases outside the public repository and use the same evaluation/result protocol.

## Repository completeness changes

For changes to the skill repository itself:

- treat the manifest, router, validator, test suite, evaluations, README inventory, and agent guidance as one consistency surface;
- preserve one owning skill for a framework capability unless repository evidence justifies a new boundary; before adding a near-duplicate skill, check whether the domain is already owned;
- register every new skill in `skill-manifest.yml` and make the canonical validator execute every repository test;
- keep each `SKILL.md` within the size gate by moving deep knowledge into skill-local `references/` one level deep;
- implementation-pattern guidance lives in the top-level `references/` directory (e.g. `references/agent-discipline.md`), NOT in a `patterns/` directory — the companion packs (ruby-agent-skills, react-agent-skills) name the equivalent surface `patterns/`; this deviation is intentional, documented here, and is not a completeness gap. Cross-pack tooling that expects `patterns/` on every pack must treat the directory name as pack-specific;
- resolve current Node.js LTS behavior from the supported runtime version before adding triggers or guidance;
- do not claim repository completeness from counts alone; verify executable registration, routing, evaluation coverage, and regression tests.

## Framework strategy

Core skills are framework-neutral. Framework, ORM, queue, cloud, and infrastructure integrations are adapters layered on top of the core contracts.
