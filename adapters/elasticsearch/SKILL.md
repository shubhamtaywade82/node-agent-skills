---
name: adapter-elasticsearch
description: Use when the repository uses Elasticsearch JavaScript.
---

# Elasticsearch JavaScript adapter

## Purpose

Translate framework-neutral Node.js guidance into Elasticsearch JavaScript-specific mechanics.

## Activate when

- Elasticsearch JavaScript is present in the target repository.
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

1. Detect Elasticsearch JavaScript and exact package version.
2. Select the framework-neutral skill owner.
3. Apply Elasticsearch JavaScript-specific client and service mechanics.
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

https://www.elastic.co/docs/reference/elasticsearch/clients/javascript

## Version scope

current @elastic/elasticsearch.

## Adapter guidance

Match client major to cluster compatibility; reuse clients; bound retries and query sizes; design mappings/aliases deliberately; keep authorization outside relevance; measure indexing and search latency.
