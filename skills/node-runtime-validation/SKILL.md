---
name: node-runtime-validation
description: boundary
---

# Node Runtime Validation

## Purpose
Use when external JSON, HTTP responses, environment values, files, queues, or dynamic JavaScript enter typed Node.js code.

## Activate when
Validate untrusted data once at the trust boundary, then pass narrowed values inward.

## Repository inspection
- Third-party JSON.
- Runtime configuration.
- Queue or file payloads.

## Decision rules
Locate the trust boundary, validation library, generated types, transport client, error normalization, and redaction policy.

## Implementation procedure
- unknown is the default external type.
- Validate before business logic consumes data.
- Keep transport errors distinct from schema errors.
- Centralize schemas at the owning boundary.
- Never log unredacted invalid payloads.

## Failure modes
1. Define the accepted runtime shape.
2. Parse and validate.
3. Normalize transport values.
4. Return a typed value or safe failure.
5. Test missing, malformed, extra, and drifted input.

## Verification
- Direct JSON.parse followed by assertion.
- Generated types treated as runtime proof.
- Validation duplicated across consumers.
- Secrets in validation logs.

## Source foundation
Exercise valid, malformed, missing, and version-drift payloads and verify deterministic caller behavior.
