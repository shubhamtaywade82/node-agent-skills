---
name: node-rate-limiting
description: Use when limiting request, command, or resource consumption by user, tenant, API key, IP, route, or service across one or many Node.js instances.
---

# Rate Limiting

## Purpose
Rate limits are explicit admission policies. They require a defined identity, scope, algorithm, storage model, and failure behavior.

## Activate when
- Protecting APIs from abuse or accidental bursts.
- Enforcing tenant/provider quotas.
- Coordinating limits across horizontally scaled instances.

## Repository inspection
Identify identity source, route cost, instance count, current clock assumptions, shared state, limit windows, and client retry behavior.

## Decision rules
| Concern | Rule |
|---|---|
| Identity | Choose the identity actually being protected: tenant, credential, IP, operation, or resource. |
| Scope | Define whether the limit is per route, service, tenant, provider, or global. |
| Algorithm | Choose fixed window, sliding window, token bucket, or leaky bucket based on burst semantics. |
| Distributed state | Single-process counters do not enforce a global limit across replicas. |
| Failure | Decide whether limiter storage outage fails open, fails closed, or uses a bounded local fallback. |
| Cost | Give expensive operations weighted cost where a request count alone is misleading. |
| Feedback | Return explicit limit metadata and retry guidance when supported by the contract. |

## Implementation procedure
1. Define the protected resource and identity.
2. Select algorithm and burst allowance.
3. Choose centralized or local state.
4. Bound limiter-store latency and failures.
5. Apply limits before expensive work.
6. Instrument allowed, rejected, and storage-error paths.

## Failure modes
- Limit is per process when the contract says global.
- IP-only limits allow one tenant to bypass a per-tenant quota.
- Clock assumptions create window-edge bursts.
- Redis outage silently disables a critical abuse-control policy.
- Client retries amplify rejected traffic.

## Verification
Test burst traffic, multiple instances, tenant isolation, boundary timing, store outage, weighted requests, and retry behavior.
