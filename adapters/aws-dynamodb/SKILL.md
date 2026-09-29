---
name: adapter-aws-dynamodb
description: Use when the repository uses AWS DynamoDB.
---

# AWS DynamoDB adapter

## Purpose

Translate framework-neutral Node.js guidance into AWS DynamoDB-specific mechanics.

## Activate when

- AWS DynamoDB is present in the target repository.
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

1. Detect AWS DynamoDB and exact package version.
2. Select the framework-neutral skill owner.
3. Apply AWS DynamoDB-specific client and service mechanics.
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

https://docs.aws.amazon.com/code-library/latest/ug/javascript_3_dynamodb_code_examples.html

## Version scope

AWS SDK JS v3.

## Adapter guidance

Model access patterns and conditional writes explicitly; use expression attribute names/values safely; understand eventual vs strongly consistent reads; paginate scans/queries; make retries/idempotency deliberate; never treat scans as default transactional queries.
