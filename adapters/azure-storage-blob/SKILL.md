---
name: adapter-azure-storage-blob
description: Use when the repository uses Azure Storage Blob SDK.
---

# Azure Storage Blob SDK adapter

## Purpose

Translate framework-neutral Node.js data/workflow guidance into Azure Storage Blob SDK-specific mechanics.

## Activate when

- Azure Storage Blob SDK is present in the target repository.
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

1. Detect Azure Storage Blob SDK and exact version.
2. Select the framework-neutral owner of the behavior.
3. Apply Azure Storage Blob SDK-specific client/workflow mechanics.
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

https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-blob-readme

## Version scope

current @azure/storage-blob.

## Adapter guidance

Use BlobServiceClient/ContainerClient/BlobClient with the repository's identity configuration; keep containers private; stream large objects; use SAS only when short-lived delegated access is appropriate; validate object ownership and tenant isolation.
