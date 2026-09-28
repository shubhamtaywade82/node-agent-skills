# Node Agent Skills Engineering Contract

This repository is an agent-oriented Node.js + TypeScript backend skill system. Skills, manifest, routing, validators, evaluations, tests, and release metadata are one consistency surface.

## Operating sequence
1. Discover the applicable skill from skill-manifest.yml and router/ROUTING.md.
2. Inspect runtime, dependencies, architecture, public contracts, tests, and local conventions.
3. Resolve ambiguity before changing behavior.
4. Apply the smallest architecture that satisfies the contract.
5. Write or update the owning test before implementation when behavior changes.
6. Implement incrementally and verify at the boundary that owns the contract.
7. Treat external data as untrusted and async work as failure-prone.
8. Review security, concurrency, persistence integrity, observability, performance, and compatibility when implicated.
9. Report observed evidence only.

## Node + TypeScript rules
- Resolve Node version from repository configuration.
- Treat ESM/CommonJS behavior as a runtime contract.
- Prefer strict TypeScript and explicit public boundaries.
- Use unknown at untrusted boundaries; types do not validate JSON.
- Bound concurrency for data-dependent async work.
- Make timeout, cancellation, retry, and idempotency semantics explicit.
- Enforce critical persistence invariants in the database.
- Authentication establishes identity; authorization establishes permission.
- Never log credentials, tokens, or sensitive payloads.

## Skill contract
Every SKILL.md must contain valid name/description frontmatter, a precise trigger, repository inspection, decision rules, implementation procedure, failure modes, and verification. Keep skills focused and below 500 lines.

## Framework strategy
Core skills are framework-neutral. Framework, ORM, queue, cloud, and infrastructure integrations are adapters layered on top of the core contracts.
