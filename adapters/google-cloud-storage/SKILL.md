---
name: adapter-google-cloud-storage
description: Use when the repository uses Google Cloud Storage Node.js.
---

# Google Cloud Storage Node.js adapter

## Purpose

Translate framework-neutral Node.js data/workflow guidance into Google Cloud Storage Node.js-specific mechanics.

## Activate when

- Google Cloud Storage Node.js is present in the target repository.
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

1. Detect Google Cloud Storage Node.js and exact version.
2. Select the framework-neutral owner of the behavior.
3. Apply Google Cloud Storage Node.js-specific client/workflow mechanics.
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

https://cloud.google.com/nodejs/docs/reference/storage/latest

## Version scope

current @google-cloud/storage.

## Adapter guidance

Reuse Storage clients; rely on the repository's credential chain; keep buckets private by default; stream large objects; use signed URLs with bounded expiry; validate generation/version metadata when overwriting or deleting objects.
