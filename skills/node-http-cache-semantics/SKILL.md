---
name: node-http-cache-semantics
description: Use when responses are cacheable by browsers, CDNs, or shared proxies.
---

# HTTP Cache Semantics

## Purpose

using Cache-Control and related HTTP semantics without serving stale or private data incorrectly.

## Activate when

- responses are cacheable by browsers, CDNs, or shared proxies.
- The change crosses a runtime, filesystem, HTTP, authorization, or observability boundary.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, test/build/CI commands, and deployment model.
2. Locate the authoritative implementation and neighboring tests/configuration.
3. Identify trust boundaries, resource ownership, and operational telemetry.
4. Confirm exact dependency/runtime versions before using version-specific mechanics.

## Decision rules

cacheability is a property of response semantics and data sensitivity; authenticated/private data is isolated from shared caches; invalidation is explicit

- Prefer explicit policies and bounded resources over framework defaults.
- Preserve security, data integrity, and public contracts.
- Separate runtime evidence from assumptions.

## Implementation procedure

1. Classify responses.\n2. Set Cache-Control directives.\n3. Define freshness/staleness policy.\n4. Include Vary dimensions.\n5. Test public/private/authenticated responses.\n6. Measure hit behavior.

## Failure modes

Avoid:

- caching user-specific responses publicly; wildcard caching of mutation responses; missing Vary for negotiated data.
- Unbounded resource creation, logging, or network activity.
- Security decisions based only on client-controlled metadata.

## Verification

1. Add a failing regression/contract test first.
2. Exercise boundary, failure, security, and cleanup cases relevant to the change.
3. Run focused tests and the full repository gates.
4. Review the final diff, generated/configuration changes, and residual risk.
5. Report exactly what was verified and what remains unverified.
