# Wave 12 — agent governance and network security

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add agent-governance skills (preflight, evidence gathering, change safety, verification reporting, risk escalation, rollback planning, commit hygiene, PR preparation) and network-security skills (DNS engineering, TLS/certificate management, proxy forwarding, HTTP timeouts/keep-alive, secure webhook ingress, request signature validation, replay protection, CSRF, open redirects, request smuggling, header normalization).

**Architecture:** Agent-governance skills own the agent-to-codebase boundary. Network-security skills own the trust boundary between reverse proxy and origin.

**Tech Stack:** Node.js 24+, TypeScript, AI agent preflight, TLS 1.3, DNS (NXDOMAIN/SERVFAIL), HMAC signatures, CSRF tokens, Forwarded header.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- No skill exceeds 500 lines.

## Review Focus

- Preflight: branch, commit, working tree as baseline; never infer from task description.
- Evidence gathering: distinguish facts from inference; trace behavior owner.
- Change safety: file allowlist; scope control; no unrelated refactors.
- Verification: report executed proof separately from skipped checks.
- Risk escalation: minimum unresolved decision; no destructive action.
- Rollback: state-aware; mixed-version compatibility; not just git revert.
- Commit hygiene: bisectable; coherent; generated artifacts separated.
- PR preparation: current GitHub mergeability, not stale metadata.
- DNS: NXDOMAIN/SERVFAIL/negative cache; TTL; resolver retry.
- TLS: SNI; certificate chain; hostname verification; rotation.
- Proxy: trusted proxy allowlist; hop count; scheme reconstruction.
- Timeouts: end-to-end deadline; AbortSignal; stage budgets.
- Webhook ingress: signature verification; constant-time compare.
- CSRF: double-submit or synchronizer token; SameSite.
- Open redirect: allowlist of redirect destinations.
- Request smuggling: content-length vs transfer-encoding conflict.
- Header normalization: case-insensitive; no duplicates.

## Tasks

### Task 1: Agent governance
- Created `skills/node-agent-preflight/SKILL.md`, `skills/node-agent-evidence-gathering/SKILL.md`, `skills/node-agent-change-safety/SKILL.md`, `skills/node-agent-verification-reporting/SKILL.md`, `skills/node-agent-risk-escalation/SKILL.md`, `skills/node-agent-rollback-planning/SKILL.md`, `skills/node-agent-commit-hygiene/SKILL.md`, `skills/node-agent-pr-preparation/SKILL.md`.

### Task 2: Network
- Created `skills/node-dns-engineering/SKILL.md`, `skills/node-tls-certificate-management/SKILL.md`, `skills/node-http-proxy-forwarding/SKILL.md`, `skills/node-http-timeouts/SKILL.md`, `skills/node-http-keepalive/SKILL.md`.

### Task 3: Webhook + signature + replay + CSRF + redirect + smuggling
- Created `skills/node-webhook-ingress-security/SKILL.md`, `skills/node-request-signature-validation/SKILL.md`, `skills/node-replay-protection/SKILL.md`, `skills/node-csrf-defense/SKILL.md`, `skills/node-open-redirect-defense/SKILL.md`, `skills/node-request-smuggling-defense/SKILL.md`, `skills/node-header-normalization/SKILL.md`.

### Task 4: Wave 12 adapters
- Created adapters: `graphql-yoga`, `apollo-server`. Reconciled with the GraphQL ecosystem.
- Each adapter: `SKILL.md` + `README.md` + version_scope + source URL.

### Task 5: Routing + evaluation coverage
- Added 18 routing cases in `router/ROUTING_CASES.yml`.
- Added 100 evaluation cases in `evals/cases/agent-network-security/workflow.yml`.
- Added `test/wave12_contract.test.mjs` and `test/wave12_quality_contract.test.mjs`.

## Completion gate

- `npm test` ✓
- `npm run validate` ✓
- Routing/evaluation coverage ✓
