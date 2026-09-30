---
name: node-dns-engineering
description: Use when hostname resolution, service discovery, failover, caching, or DNS failures affect backend behavior.
---

# DNS Engineering

## Purpose

designing DNS resolution behavior for Node.js services and outbound integrations.

## Activate when

- hostname resolution, service discovery, failover, caching, or DNS failures affect backend behavior.
- The change affects AI-agent execution safety or Node.js runtime/network behavior.

## Repository inspection

1. Detect Node.js/TypeScript version, package manager, framework, tests, build, and CI.
2. Locate the authoritative source of the behavior and the relevant consumers.
3. Inspect security, deployment, proxy, and configuration boundaries.
4. Confirm exact dependency/runtime versions before using version-specific APIs.

## Decision rules

- DNS answers are ephemeral inputs; a lookup result is not a durable identity guarantee.
- Respect positive and negative TTL semantics rather than inventing indefinite caches.
- Distinguish NXDOMAIN, SERVFAIL, timeout, and downstream connection failure because remediation differs.
- Bound resolver retries so a resolver outage does not become a synchronized application retry storm.
## Implementation procedure

1. Identify resolver path.
2. Understand cache/TTL.
3. Handle multiple records.
4. Bound lookup time.
5. Observe failures.
6. Account for IPv4/IPv6 and private ranges.
7. Test changes.

## Failure modes

Avoid:

- assuming one stable IP; infinite DNS retries; validating a hostname but not resolved addresses.
- Speculative changes based on missing context.
- Unbounded retries, resource creation, or network trust.

## Verification

1. Add regression/contract coverage before behavior changes.
2. Exercise failure, boundary, and security cases.
3. Run focused tests and the full repository gates.
4. Inspect the final diff and base/head relationship.
5. Report factual verification results and residual risk.
