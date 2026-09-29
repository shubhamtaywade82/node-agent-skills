---
name: adapter-aws-eventbridge
description: Use when the repository uses AWS EventBridge SDK v3.
---

# AWS EventBridge SDK v3 adapter

## Purpose

Translate framework-neutral Node.js data/workflow guidance into AWS EventBridge SDK v3-specific mechanics.

## Activate when

- AWS EventBridge SDK v3 is present in the target repository.
- The detected version matches the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, deployment/cloud configuration, and imports.
2. Confirm the exact installed version.
3. Locate resource/client construction, identity configuration, and lifecycle ownership.
4. Inspect integration tests, emulators, and operational runbooks.

## Decision rules

- Keep domain/data contracts and retry semantics in the framework-neutral core skills.
- Reuse long-lived clients/resources.
- Treat cloud/provider responses as untrusted runtime data.
- Never hard-code credentials, tokens, or environment-specific identifiers.

## Implementation procedure

1. Detect AWS EventBridge SDK v3 and exact version.
2. Select the framework-neutral owner of the behavior.
3. Apply AWS EventBridge SDK v3-specific client/workflow mechanics.
4. Add failure, timeout, replay, and cleanup coverage.
5. Verify production identity and graceful lifecycle behavior.

## Failure modes

- Version-incompatible examples.
- Client/resource creation per request.
- Infinite retries or replay-unsafe workflows.
- Public storage or secret leakage by default.

## Verification

1. Run focused integration tests or a supported emulator/local service.
2. Run the full suite and build/typecheck gates.
3. Verify cleanup, credentials, and least-privilege behavior.
4. Exercise transient failure and duplicate/replay paths.

## Source

https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_eventbridge_code_examples.html

## Version scope

AWS SDK v3.

## Adapter guidance

Use @aws-sdk/client-eventbridge; define stable source/detail-type semantics; keep event payloads small and validated; reuse clients; classify PutEvents failures; preserve idempotency downstream; use EventBridge rules/targets as routing infrastructure.
