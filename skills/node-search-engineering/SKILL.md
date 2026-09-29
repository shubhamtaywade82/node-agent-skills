---
name: node-search-engineering
description: Use when adding Elasticsearch/OpenSearch/Meilisearch-like search, autocomplete, or indexed filtering.
---

# Search Engineering

## Purpose

designing search/indexing workflows with explicit consistency and query semantics.

## Activate when

- adding Elasticsearch/OpenSearch/Meilisearch-like search, autocomplete, or indexed filtering.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

search indexes are derived state; model freshness; isolate query syntax; protect against unbounded queries; authorize results independently of search relevance

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define source of truth.\n2. Choose indexing trigger.\n3. Model document version/id.\n4. Design reindex and alias strategy.\n5. Bound query/filter/page sizes.\n6. Enforce authorization.\n7. Measure freshness.

## Failure modes

Avoid:

- treating search as durable truth; indexing only best-effort with no reconciliation; leaking cross-tenant documents; deep pagination without limits.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
