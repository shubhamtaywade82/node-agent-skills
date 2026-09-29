---
name: adapter-opentelemetry-sdk-node
description: Use when the repository uses @opentelemetry/sdk-node.
---

# @opentelemetry/sdk-node adapter

## Purpose

Translate framework-neutral Node.js guidance into @opentelemetry/sdk-node-specific mechanics.

## Activate when

- @opentelemetry/sdk-node is present in the target repository.
- The detected version matches the documented scope or has been explicitly verified.

## Repository inspection

1. Inspect package.json, lockfile, Node.js version, and imports.
2. Confirm the exact installed package and peer framework versions.
3. Locate registration/bootstrap order and lifecycle ownership.
4. Inspect integration tests and CI commands.

## Decision rules

- Core Node.js skills remain authoritative for security, reliability, and architecture.
- Detect exact package versions before selecting adapter APIs.
- Keep domain logic independent from framework and plugin configuration.
- Treat incoming payloads, headers, multipart parts, and telemetry attributes as untrusted runtime data.

## Implementation procedure

1. Detect @opentelemetry/sdk-node and exact version.
2. Select the owning framework-neutral skill.
3. Apply the @opentelemetry/sdk-node-specific mechanics below.
4. Add focused boundary/integration coverage including failure and cleanup.
5. Run the full repository validation gates.

## Failure modes

Avoid:

- Applying APIs from an incompatible major version.
- Relying on plugin defaults for security or resource limits.
- Leaking secrets or unbounded identifiers into generated artifacts or telemetry.
- Leaving streams, temporary files, subscriptions, or SDK resources open.

## Verification

1. Run focused integration tests.
2. Exercise invalid input, security failures, shutdown, and cleanup.
3. Run the full test suite and repository validator.
4. Review the final configuration for unintended exposure or resource growth.

## Source

https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node

## Version scope

current.

## Adapter guidance

Initialize the Node SDK before application instrumentation; configure trace/metric exporters and instrumentations explicitly; keep resource attributes bounded and never attach secrets or unbounded identifiers to telemetry.
