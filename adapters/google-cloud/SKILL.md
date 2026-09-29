---
name: adapter-google-cloud
description: Use when the repository uses Google Cloud Node.js clients.
---

# Google Cloud Node.js clients adapter

## Purpose

Translate framework-neutral Node.js guidance into Google Cloud Node.js clients-specific mechanics.

## Activate when

- Google Cloud Node.js clients is present in the target repository.
- The detected installed version and service environment match the documented scope.

## Repository inspection

1. Inspect package.json, lockfile, cloud/runtime configuration, imports, and deployment manifests.
2. Confirm the exact installed SDK version.
3. Locate client construction, credentials/identity, lifecycle, and shutdown ownership.
4. Inspect integration tests, emulators, and error handling.

## Decision rules

- Keep credentials and configuration in explicit runtime boundaries.
- Reuse clients where supported and avoid per-request setup of long-lived resources.
- Treat service responses as untrusted runtime data.
- Keep retries, deadlines, authorization, and persistence semantics in their core skills.

## Implementation procedure

1. Detect Google Cloud Node.js clients and exact package version.
2. Select the framework-neutral skill owner.
3. Apply Google Cloud Node.js clients-specific client and service mechanics.
4. Add failure, timeout, duplicate, and cleanup tests.
5. Verify production identity/configuration and observability.

## Failure modes

- Hard-coded credentials or region/project identifiers.
- Mixing incompatible client/cluster/service versions.
- Unbounded scans, bulk requests, retries, or query sizes.
- Assuming cloud-side authentication equals application-level authorization.

## Verification

1. Run focused integration tests or emulators.
2. Run full suite and build/typecheck gates.
3. Verify secret handling and client lifecycle.
4. Verify quota/transient failure behavior and safe retry semantics.

## Source

https://docs.cloud.google.com/nodejs/docs/reference

## Version scope

current Google Cloud Node.js client libraries.

## Adapter guidance

Use the service-specific Cloud Client Library where supported; prefer application-default credential mechanisms appropriate to the environment; reuse clients; distinguish quota/transient errors; keep region/project config explicit; test emulator/local paths where available.
