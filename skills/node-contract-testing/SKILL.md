---
name: node-contract-testing
description: Use when independently deployed services, API clients, webhooks, event consumers, or external integrations need explicit request/response compatibility guarantees.
---

# Contract Testing

## Purpose
Protect integration boundaries with executable contracts without coupling services to each other's implementation.

## Activate when
- Clients and providers deploy independently.
- API, webhook, or event schemas change.
- Mock-based tests drift from real boundary behavior.

## Repository inspection
Inspect API schemas, generated clients, event payloads, webhook fixtures, versioning rules, provider ownership, and integration-test environments.

## Decision rules
| Concern | Rule |
|---|---|
| Boundary | Validate the interface, not internal implementation. |
| Ownership | Providers own guarantees; consumers express required behavior. |
| Schema | Prefer explicit machine-readable schemas. |
| Compatibility | Test compatible and intentionally breaking changes separately. |
| Mocks | A mock is evidence only when derived from or checked against the authoritative contract. |
| Release | Run contract checks before provider/consumer promotion when coupling permits. |

## Implementation procedure
1. Identify the authoritative contract.
2. Define consumer expectations and provider guarantees.
3. Encode representative success and failure cases.
4. Execute contract checks against the provider or a verified artifact.
5. Gate breaking changes.
6. Retain contracts needed for mixed-version operation.

## Failure modes
- Tests assert formatting instead of semantics.
- Consumer mocks change without provider verification.
- Schema optionality differs from runtime behavior.
- Contract tests are absent from the release path.

## Verification
Prove compatible versions pass, incompatible changes fail intentionally, and contract artifacts match deployed behavior.