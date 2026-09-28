---
name: node-runtime-validation
description: Use when external JSON, HTTP responses, environment values, files, queues, or dynamic JavaScript enter typed Node.js code.
---

# Node Runtime Validation

## Purpose
Validate untrusted data once at the trust boundary, then pass narrowed values inward.

## Activate when
Consume third-party JSON, runtime configuration, queue messages, file payloads, or dynamic values.

## Repository inspection
Locate the trust boundary, validation library, generated types, transport client, error normalization, and redaction policy.

## Decision rules
unknown is the default external type. Validate before business logic. Keep transport and schema failures distinct. Centralize schemas at the owning boundary. Never log unredacted invalid payloads.

## Implementation procedure
1. Define accepted runtime shape. 2. Parse and validate. 3. Normalize transport values. 4. Return typed value or safe failure. 5. Test malformed and drifted input.

## Failure modes
Direct JSON.parse followed by assertion; generated types treated as runtime proof; duplicated validation; secrets in logs.

## Verification
Exercise valid, malformed, missing, extra, and version-drift payloads and verify deterministic caller behavior.

## Source foundation
https://www.typescriptlang.org/docs/handbook/2/narrowing.html
