---
name: node-pagination-filtering
description: Use when implementing list endpoints with pagination, sorting, filtering, search, cursors, offsets, or large result sets under concurrent writes.
---

# Pagination and Filtering

## Purpose
Make collection APIs deterministic, bounded, and efficient as data volume and concurrent mutations grow.

## Activate when
- A list endpoint can return more than a small bounded dataset.
- Clients need filtering, sorting, page navigation, or incremental synchronization.
- Offset pagination becomes slow or produces duplicates/skips under concurrent writes.

## Repository inspection
Inspect table/index strategy, default ordering, existing query builders, maximum page size, total-count behavior, filters, searchable fields, and client navigation assumptions.

## Decision rules
| Concern | Rule |
|---|---|
| Ordering | Always define a stable total order. Add a unique tiebreaker. |
| Cursor | Prefer keyset/cursor pagination for large or frequently changing datasets. |
| Offset | Acceptable for bounded/admin views when performance and drift are understood. |
| Page size | Enforce a server-side maximum regardless of client input. |
| Filtering | Allowlist fields/operators; never interpolate raw SQL fragments. |
| Sorting | Allowlist sortable fields and directions. |
| Count | Treat exact total counts as a separate cost decision; do not hide expensive counts in every request. |
| Consistency | Document snapshot/drift semantics when data changes between pages. |

## Implementation procedure
1. Choose an order that uniquely identifies every row.
2. Define the cursor/offset contract and validation rules.
3. Bound page size and result materialization.
4. Map public filters/sorts to safe query expressions.
5. Verify indexes support the common filter + order path.
6. Test concurrent inserts/deletes and invalid cursors.

## Failure modes
- Ordering by a non-unique field alone can duplicate or skip records.
- Client-controlled SQL fragments create injection risk.
- Default page size is effectively unbounded.
- Cursor contains unvalidated or mutable fields.
- Exact count requirements force expensive scans.
- Different endpoints encode cursors inconsistently.

## Verification
Test first/last page, empty page, invalid cursor, maximum page size, stable ordering, and mutations between page fetches. Prefer integration tests for query behavior.