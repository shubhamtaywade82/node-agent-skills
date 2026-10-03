# Wave 13 — pack distribution and agent governance

Adds 20 framework-neutral skills plus a deterministic pack exporter.

## Skills

- Agent Skills format and cross-agent compatibility
- Manifest, routing, evaluation, source, version, release, distribution, and installation governance
- Progress tracking and task checkpointing
- Context budgeting and deliberate tool selection
- Command safety and structured output contracts
- Handoff, recovery, multi-file coordination, regression prevention

## Distribution

`npm run pack:export` exports a self-contained filesystem pack with:
- README, LICENSE, manifest, routing, contract documentation
- all skills and adapters
- deterministic `pack-manifest.json`
- SHA-256 `checksums.sha256`

## Verification

- npm test
- npm run validate
- npm run pack:export
