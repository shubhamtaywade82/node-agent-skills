---
name: node-openapi
description: Use when publishing, reviewing, generating, or validating OpenAPI contracts for Node.js HTTP APIs, including schema drift, code generation, and compatibility checks.
---

# OpenAPI

## Purpose
Treat the API contract as a machine-readable compatibility boundary, not a second copy of implementation prose.

## Activate when
- Adding or changing HTTP operations.
- Generating SDKs, validators, documentation, or mocks from an API schema.
- Detecting drift between implementation and published OpenAPI.

## Repository inspection
Locate the OpenAPI document, generation/validation scripts, route definitions, DTO schemas, error models, and CI contract checks. Identify whether the project is spec-first or code-first.

## Decision rules
| Concern | Rule |
|---|---|
| Version | Record the OpenAPI version used by the project. This guide targets OAS 3.1 semantics unless a repository contract says otherwise. |
| Source of truth | Pick one authoritative contract source and enforce drift checks. |
| Schemas | Reuse schemas with references; avoid duplicating incompatible shapes. |
| Errors | Define reusable error schemas and documented status responses. |
| Examples | Keep examples valid against the schema and representative of real payloads. |
| Compatibility | Treat removals/type narrowing/status changes as breaking changes. |
| Security | Document authentication schemes without embedding secrets or operational credentials. |

## Implementation procedure
1. Identify operations, parameters, request bodies, responses, security requirements, and error cases.
2. Encode domain-neutral transport schemas rather than database structures.
3. Validate the document and generated artifacts in CI.
4. Add compatibility/diff checks for changes to public contracts.
5. Keep runtime validation aligned with the published schema.

## Failure modes
- OpenAPI says a field is required but runtime accepts absence.
- Generated SDKs target a schema the server no longer implements.
- Error responses are undocumented or inconsistent.
- Schema examples parse but violate semantic invariants.
- Code-first generation hides breaking changes in an opaque diff.

## Verification
Validate the document, execute representative requests against the implementation, and run an automated schema diff in CI.
Source: https://spec.openapis.org/oas/v3.1.0
