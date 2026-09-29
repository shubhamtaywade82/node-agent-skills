---
name: node-object-storage
description: Use when uploads, downloads, attachments, exports, media, or large blobs are introduced.
---

# Object Storage Integration

## Purpose

integrating S3-compatible object storage without turning the application server into an unbounded file proxy.

## Activate when

- uploads, downloads, attachments, exports, media, or large blobs are introduced.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

store immutable object identifiers and metadata separately from blobs; keep buckets private by default; validate size/type; prefer streaming or presigned URLs where appropriate

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define object key ownership.\n2. Validate content length/type.\n3. Use checksums where useful.\n4. Select multipart threshold.\n5. Issue short-lived presigned URLs.\n6. Model orphan cleanup.\n7. Keep tenant isolation in keys/policies.

## Failure modes

Avoid:

- trusting client MIME type; public buckets by convenience; path traversal keys; buffering large objects; deleting metadata before durable storage state is known.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
