---
name: node-caching
description: Use when introducing application caching, cache-aside patterns, TTLs, invalidation, stampede protection, stale data handling, or cache consistency in Node.js services.
---

# Caching

## Purpose
A cache is a performance layer, not automatically a source of truth. Every cache design needs explicit freshness, invalidation, capacity, and failure semantics.

## Activate when
- Adding Redis or in-process caches around database/API reads.
- Reducing repeated expensive work.
- Diagnosing stale data, cache stampedes, eviction, or inconsistent tenant data.

## Repository inspection
Identify source-of-truth storage, key scope, TTL, invalidation triggers, serialization format, cache size, eviction policy, request concurrency, and failure behavior when the cache is unavailable.

## Decision rules
| Concern | Rule |
|---|---|
| Source of truth | Define the authoritative store independently of the cache. |
| Key scope | Include tenant/account/resource dimensions required for isolation. |
| TTL | Choose freshness from business semantics; TTL is not a correctness substitute for strict invalidation requirements. |
| Stampede | Bound concurrent fills with coalescing, locking, jitter, or another measured strategy. |
| Errors | Cache backend failure should follow an explicit fail-open/fail-closed policy. |
| Serialization | Version cache values when schema evolution can overlap deployments. |
| Negative cache | Use only when absence is stable enough; define short expiry. |

## Implementation procedure
1. Define cacheability and acceptable staleness.
2. Design bounded, tenant-safe keys.
3. Choose cache-aside, write-through, or another pattern intentionally.
4. Add TTL and invalidation semantics.
5. Bound concurrent fills and cache size.
6. Instrument hit rate, misses, evictions, fill latency, and backend errors.

## Failure modes
- Stale cached authorization or tenant data.
- Unbounded in-process memory cache.
- Cache stampede after synchronized expiry.
- Invalidated key repopulated from stale source state.
- Redis outage turns a latency optimization into an availability outage.

## Verification
Test cache hit/miss, expiry, invalidation race, stampede behavior, tenant isolation, serialization compatibility, and cache-backend outage.
