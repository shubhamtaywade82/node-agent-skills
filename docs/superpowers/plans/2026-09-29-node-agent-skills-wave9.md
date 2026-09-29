# Wave 9 — identity, SLOs, and test tooling

Adds 18 framework-neutral skills for measurable reliability, operational ownership, identity/session security, and deterministic backend test/performance workflows.

Adds four adapters:
- Node.js `node:test`
- Supertest
- oauth4webapi
- openid-client

## Guardrails

- Reliability objectives must map to measurable user-visible outcomes.
- Security identity state is revocable and server-authoritative where required.
- Passwords are never stored reversibly.
- Test and benchmark environments remain deterministic and isolated.
- Exact adapter versions are detected from the target repository.

## Verification

`npm test`
`npm run validate`
