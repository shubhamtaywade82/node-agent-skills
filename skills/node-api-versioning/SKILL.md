---
name: node-api-versioning
description: Use when evolving public HTTP APIs across incompatible contracts, deprecating endpoints, supporting multiple client generations, or planning API migrations.
---

# API Versioning

## Purpose
Make API evolution explicit and bounded so clients can migrate without accidental contract breaks.

## Activate when
- Adding v2/v3 endpoints or changing response/request meaning.
- Removing fields, changing status semantics, or changing authentication behavior.
- Supporting mobile, partner, or long-lived clients with different release cadences.

## Repository inspection
Map deployed client populations, public routes, SDKs, contract tests, gateway rules, documentation, telemetry, and current deprecation mechanisms. Identify whether compatibility is path-, header-, media-type-, or capability-based.

## Decision rules
| Situation | Rule |
|---|---|
| Additive compatible change | Prefer the existing version if semantics remain compatible. |
| Breaking semantic change | Introduce an explicitly versioned contract. |
| Version coexistence | Define owner, start date, deprecation window, and retirement signal. |
| Field removal | Deprecate before removal and measure actual usage. |
| Internal API | Avoid versioning merely for organizational boundaries; use compatibility discipline instead. |
| Compatibility | Preserve status, error, auth, pagination, and idempotency semantics—not only JSON fields. |

## Implementation procedure
1. Write the old and new contracts side by side.
2. Enumerate breaking differences and migration requirements.
3. Select a versioning mechanism consistent with existing clients and infrastructure.
4. Keep version-specific translation at the API boundary; do not fork core domain logic unnecessarily.
5. Instrument usage of old versions and deprecated fields.
6. Document sunset criteria and rollback strategy.
7. Add contract tests for both versions during the coexistence period.

## Failure modes
- Two versions silently diverge in business rules.
- Deprecation exists in docs but no usage telemetry.
- A “non-breaking” change alters error or pagination semantics.
- Version selection can be ambiguous or spoofed.
- Old clients receive new authorization behavior without a migration plan.

## Verification
- Contract tests prove each supported version independently.
- Compatibility tests cover errors, auth, pagination, idempotency, and content negotiation.
- Deprecation telemetry identifies remaining consumers before removal.
- Source reference: https://spec.openapis.org/oas/v3.1.0
