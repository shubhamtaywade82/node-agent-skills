---
name: node-runtime-validation
description: Use when validating untrusted JSON, external input, environment variables, queue payloads, or webhook bodies at a Node.js boundary.
---

# Node Runtime Validation

## Purpose

TypeScript types do not validate runtime data. JSON, env vars, queue payloads, webhook bodies, and external API responses are all `unknown` until proven otherwise. This skill owns the boundary where untrusted bytes become typed values.

## Activate when

- Parsing request bodies, params, query strings, headers, or cookies.
- Reading environment variables at startup.
- Consuming queue messages, webhook payloads, or external API responses.
- Defining the input/output schema for an internal module boundary.
- Choosing between `zod`, `valibot`, `@sinclair/typebox`, `ajv`, or hand-written guards.

## Repository inspection

1. Validation library — grep for `zod`, `valibot`, `@sinclair/typebox`, `ajv`, `joi`, `yup`, `superstruct`. Read the version and import shape.
2. Boundary handlers — grep for `req.body`, `request.body`, `event.body`, `message.json()`. Find every place external data is consumed.
3. Env config — find the module that reads `process.env`. Confirm it validates, not just reads.
4. Queue/webhook consumers — find every `consume(`, `subscribe(`, `messageHandler(`. Confirm each parses + validates before processing.
5. Schema definitions — grep for `z.object(`, `object(`, `Type.Object(`, `schema.shape`. Read the schemas for the top 5 endpoints.
6. Error handling — find where validation errors are caught and how they map to the public error envelope.

## Decision rules

| Concern | Rule |
|---|---|
| Boundary | Validate every external input exactly once, at the boundary, into a typed internal shape. |
| Type source | The TypeScript type is derived from the schema (`z.infer<typeof schema>`), not written by hand. |
| Failure | Validation failure returns a 4xx (400 for body, 422 for semantic), never 500. The error message must not leak internal structure. |
| Env vars | Validate at startup. Fail fast — do not start the server with a missing required variable. |
| Numbers | Reject `NaN`, `Infinity`, and string-encoded numbers from JSON. Use `z.coerce.number()` with care. |
| Dates | Reject string dates that do not parse to a real `Date`. Decide on ISO-8601 vs epoch millis as the wire format. |
| Strings | Bound the length. Reject control characters except `\n\t`. Strip BOM. Decide on Unicode normalization (NFC). |
| Arrays | Bound the length. Bound the element count even when each element is small (DoS prevention). |
| Unknown keys | Reject by default (`z.strict()`); allow only when the source is forward-compatible (webhook from a third party). |
| Coercion | Prefer explicit parsing over coercion. `z.coerce.boolean()` is a footgun — `false` becomes `false`, `0` becomes `false`, `""` becomes `false`, `"false"` becomes `true`. |
| Performance | Compile schemas once at module load, not per request. `zod` schemas are reusable; `ajv` needs `compile` once. |

## Implementation procedure

1. Identify the boundary: HTTP handler, queue consumer, env-config loader, webhook receiver.
2. Pick the schema library based on the repository's existing dependencies and the validation complexity.
3. Define the schema for every external input shape the boundary accepts. Include min/max lengths, ranges, allowed values, and rejection of unknown keys.
4. Derive the TypeScript type from the schema (`z.infer`, `InferOutput`, `Static<typeof schema>`).
5. Validate at the boundary; on failure, return a stable error envelope with a correlation ID.
6. For env vars: validate at startup, fail fast, log the missing/invalid variable name (not its value if sensitive).
7. Add a property-based test that feeds the schema random inputs and confirms rejection within the bound.

## Failure modes

- Hand-written `if (typeof x === "string")` checks instead of a schema — misses nested objects, arrays, null.
- TypeScript type written by hand and the runtime schema separately — they drift.
- `z.coerce.boolean()` on a string `"false"` → returns `true` (non-empty string is truthy).
- Unbounded array length → DoS via a 10MB JSON array of strings.
- Unknown keys silently ignored → caller thinks they sent the right payload, behavior diverges.
- Validation error returns `"Invalid input"` with no field name → caller cannot debug.
- Env var read at request time, not startup → request fails 1% of the time when the var is briefly missing.
- Schema compiled per request → 10× CPU overhead; saturates the event loop under load.

## Verification

- Test happy path: valid input → parsed correctly.
- Test failure paths: missing required field, wrong type, too long, too short, unknown key, null where required, array too long.
- Test boundary cases: empty string, empty array, maximum length, Unicode edge cases (combining chars, BOM, RTL).
- Test performance: schema parse is ≤ 1ms per request; compile cost is amortized across requests.
- Test env startup: server refuses to start with `MISSING_REQUIRED_VAR` and prints the variable name (not its value).
- Confirm error messages do not leak the internal schema structure (e.g., "expected schema.shape.id to be string" is a leak).
- Source references: https://zod.dev, https://valibot.dev, https://github.com/sinclairzx/typebox, https://ajv.js.org/, https://datatracker.ietf.org/doc/html/rfc8259.
