# Wave 5 — ecosystem and agent workflow

## Scope

This wave closes broad backend gaps outside framework-specific HTTP/database adapters: repository forensics, debugging, review, refactoring, dependency upgrades, monorepos, CLIs, streams/SSE, storage/email/search integrations, cryptography, agent evaluation, documentation/DX, CloudEvents, and saga orchestration.

It also adds adapters for node-postgres, Undici, Zod, Valibot, TypeBox, KafkaJS, AWS SDK v3, Pino, Prometheus, pnpm, Turborepo, and Nx.

## Guardrails

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Completion gate

`npm test` and `npm run validate` must both pass on the Wave 5 branch and its pull request.
