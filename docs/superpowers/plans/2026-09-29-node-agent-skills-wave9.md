# Wave 9 — identity, SLO, and test-tooling

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add identity/SLO/test-tooling skills: SLI/SLO and error-budget engineering with explicit service ownership and on-call readiness, operational readiness, security incident response, vulnerability management, session revocation, OAuth/OIDC, MFA, password storage, enumeration defense, native Node test runner, HTTP integration testing, benchmarking, failure injection, and test isolation.

**Architecture:** SLO skills own the operations delivery boundary. Identity skills own the authentication boundary. Test-tooling skills own the verification boundary.

**Tech Stack:** Node.js 24+, TypeScript, SLI/SLO, OAuth/OIDC, MFA, argon2/bcrypt, native node:test runner, autocannon, k6, failure injection.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- Existing validators and routing contracts remain authoritative.
- No skill exceeds 500 lines.

## Review Focus

- SLOs: error budget is a policy, not a metric to ignore.
- On-call: runbooks exist for every page-worthy alert.
- Incident response: blameless postmortems; severity drives response.
- Password storage: argon2id preferred; bcrypt cost ≥ 12.
- MFA: TOTP or WebAuthn; SMS not allowed.
- Enumeration: same error for "user not found" and "wrong password".
- Test isolation: each test sets up and tears down its own state.

## Tasks

### Task 1: SLI/SLO + service ownership + on-call
- Created `skills/node-sli-slo-engineering/SKILL.md`, `skills/node-error-budget-engineering/SKILL.md`, `skills/node-service-ownership/SKILL.md`, `skills/node-oncall-readiness/SKILL.md`, `skills/node-operational-readiness/SKILL.md`.

### Task 2: Incident + vulnerability
- Created `skills/node-security-incident-response/SKILL.md`, `skills/node-vulnerability-management/SKILL.md`.

### Task 3: Identity
- Created `skills/node-session-management/SKILL.md` (reconciled with Wave 8), `skills/node-auth-session-revocation/SKILL.md`, `skills/node-oidc-integration/SKILL.md`, `skills/node-oauth-client-security/SKILL.md`, `skills/node-mfa-engineering/SKILL.md`, `skills/node-password-storage/SKILL.md`, `skills/node-user-enumeration-defense/SKILL.md`.

### Task 4: Test-tooling
- Created `skills/node-native-test-runner/SKILL.md`, `skills/node-http-testing/SKILL.md`, `skills/node-benchmark-engineering/SKILL.md`, `skills/node-failure-injection-testing/SKILL.md`, `skills/node-test-isolation-engineering/SKILL.md`.

### Task 5: Wave 9 adapters
- Created adapters: `@aws-sdk/client-sqs`, `@aws-sdk/client-sns`, `@aws-sdk/client-dynamodb`, `@opensearch-project/opensearch`, `@elastic/elasticsearch`, `azure-sdk`, `google-cloud`, `amqplib`, `nats`, `aws-sqs`, `aws-sns`, `aws-dynamodb`.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 6: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 18 evaluation cases in `evals/cases/identity-slos-test-tooling/workflow.yml`.
- Added `test/wave9_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
