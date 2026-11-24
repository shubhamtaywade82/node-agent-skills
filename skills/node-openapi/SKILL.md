---
name: node-openapi
description: Use when publishing, reviewing, generating, or validating OpenAPI contracts for Node.js HTTP APIs, including schema drift, code generation, and compatibility checks.
license: MIT
---

# OpenAPI

## Purpose

Treat the API contract as a machine-readable compatibility boundary, not a second copy of implementation prose. The OpenAPI document and the implementation drift silently unless a check enforces alignment; the contract is worth exactly what its drift check is worth.

## Activate when

- Adding or changing HTTP operations.
- Generating SDKs, validators, documentation, or mocks from an API schema.
- Detecting drift between implementation and published OpenAPI.

## Repository inspection

Locate the OpenAPI document, generation/validation scripts, route definitions, DTO schemas, error models, and CI contract checks. Identify whether the project is spec-first or code-first: the drift direction differs (spec-first validates implementation against the document; code-first validates the generated document against actual behavior).

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

Breaking-change classification (for compatibility diff gates):

| Change | Class |
|---|---|
| New endpoint, new optional field, new response | Non-breaking (minor) |
| Field removal, type narrowing (`string` → `enum`), required added | Breaking (major) |
| Status code removed or semantic change (200 → 202) | Breaking |
| New error status documented on existing path | Non-breaking (clients should already tolerate unexpected statuses) |
| Renamed field (remove + add) | Breaking |

## Implementation procedure

1. Identify operations, parameters, request bodies, responses, security requirements, and error cases.
2. Encode domain-neutral transport schemas rather than database structures.
3. Validate the document and generated artifacts in CI.
4. Add compatibility/diff checks for changes to public contracts.
5. Keep runtime validation aligned with the published schema.

**Reference example** — spec-first with a runtime drift check and compatibility gate:

```yaml
# openapi/order.yaml — reusable component schemas, not database mirrors
components:
  schemas:
    Order:
      type: object
      required: [id, status, totalCents, placedAt]
      properties:
        id:            { type: string, examples: ["ord_01H5..."] }
        status:        { type: string, enum: [open, paid, shipped] }
        totalCents:    { type: integer, minimum: 0 }
        placedAt:      { type: string, format: date-time }
      additionalProperties: false
    ErrorEnvelope:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message, requestId]
          properties:
            code:       { type: string, examples: ["order.not_found"] }
            message:    { type: string }
            fieldErrors:
              type: object
              additionalProperties: { type: array, items: { type: string } }
            requestId:  { type: string }
  responses:
    NotFound: &NotFound
      description: Resource not found
      content: { application/json: { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } }
    ValidationError:
      <<: *NotFound
      description: Validation failed
paths:
  /orders/{id}:
    get:
      operationId: getOrder
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200": { content: { application/json: { schema: { $ref: '#/components/schemas/Order' } } } }
        "404": *NotFound
        "401": { $ref: '#/components/responses/NotFound' }
```

```ts
// scripts/check-openapi-drift.mts — CI: the contract and the routes must agree
import { spec } from "./load-spec.js";

for (const [path, methods] of spec.routes()) {
  const registered = app.hasRoute(path);                 // implementation-side truth
  assert.ok(registered, `documented but not implemented: ${path}`);
  for (const method of methods) {
    for (const status of spec.responseStatuses(path, method)) {
      const handler = app.routeHandler(path, method);
      assert.ok(handler.responses.has(status),
        `route ${method} ${path} never returns documented status ${status}`);
    }
  }
}
// Reverse: implemented routes not documented (unless deliberately internal) fail too.
```

```yaml
# .github/workflows/contract.yml — lint + drift + breaking-change gate
- run: npx @redocly/cli lint openapi.yaml
- run: node scripts/check-openapi-drift.mts
- run: npx openapi-diff openapi.released.yaml openapi.yaml --fail-on breaking
```

Runtime alignment: the same zod schemas that validate request bodies drive both the route registration and the generated document (code-first), or the spec is the generator and the route validates against it (spec-first) — one direction per repository, never both.

## Failure modes

- OpenAPI says a field is required but runtime accepts absence — drift between documented and actual validation; the contract lies.
- Generated SDKs target a schema the server no longer implements — no diff gate between released and current spec.
- Error responses are undocumented or inconsistent — the 404/422/409 shapes clients actually receive never appear in the document.
- Schema examples parse but violate semantic invariants (`totalCents: -5` passes `type: integer`, breaks `minimum: 0`).
- Code-first generation hides breaking changes in an opaque diff — a field removal lands in a regenerated 5000-line document nobody reviews; a breaking-change gate is the fix.
- Security schemes with operational credentials embedded in example values — secrets in the published document.
- Duplicate inline shapes drift apart — `Order` written twice, one updated, SDK and mock disagreeing.
- `additionalProperties` left true (default) — typos in responses pass validation forever.

## Verification

Validate the document, execute representative requests against the implementation, and run an automated schema diff in CI. Concretely: (a) `redocly lint` (or equivalent) passes — no undefined references, all operations have `operationId`, all documented responses have content or are 204; (b) drift check passes in both directions; (c) example payloads validate against their schemas, including error envelopes; (d) mock-driven contract tests (Prism or equivalent) exercise each documented path × status; (e) the diff gate fails a deliberately breaking change (remove a field → CI red) before it ships.

Source: https://spec.openapis.org/oas/v3.1.0
