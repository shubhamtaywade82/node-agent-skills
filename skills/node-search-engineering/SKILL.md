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

## Implementation procedure

1. Define source of truth.
2. Choose indexing trigger.
3. Model document version/id.
4. Design reindex and alias strategy.
5. Bound query/filter/page sizes.
6. Enforce authorization.
7. Measure freshness.

## Failure modes

Avoid:

- treating search as durable truth; indexing only best-effort with no reconciliation; leaking cross-tenant documents; deep pagination without limits.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
