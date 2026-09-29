---
name: adapter-azure-sdk
description: Use when the repository uses Azure SDK for JavaScript.
---

# Azure SDK for JavaScript adapter

## Purpose

Translate framework-neutral Node.js guidance into Azure SDK for JavaScript-specific mechanics.

## Activate when

- Azure SDK for JavaScript is present in the target repository.
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

1. Detect Azure SDK for JavaScript and exact package version.
2. Select the framework-neutral skill owner.
3. Apply Azure SDK for JavaScript-specific client and service mechanics.
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

https://learn.microsoft.com/en-us/azure/developer/javascript/

## Version scope

current Azure SDK for JavaScript.

## Adapter guidance

Use service-specific Azure SDK clients and the repository's configured identity mechanism; reuse clients; avoid embedding credentials; bound network calls; inspect transient/permanent errors; verify lifecycle and telemetry.
