# Wave 6 — advanced services and agent engineering

## Scope

Wave 6 extends the framework-neutral pack into advanced service communication, security modeling, modernization, and test-environment workflows. It adds 18 core skills and 11 concrete adapters.

## Guardrails

- Protocols and schemas are treated as compatibility contracts.
- Application and infrastructure retry/deadline responsibilities are kept distinct.
- Authorization is explicit and deny-by-default.
- Legacy changes are characterized before migration.
- Test data and environments are deterministic and privacy-safe.
- Adapters are version-scoped and selected only after repository inspection.

## Verification

`npm test` and `npm run validate` are required completion gates.
