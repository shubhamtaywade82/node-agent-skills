---
name: node-upload-security
description: Use when users or integrations upload files to a backend.
---

# Secure File Uploads

## Purpose

handling uploaded files without content-type, path, decompression, or malware risks.

## Activate when

- users or integrations upload files to a backend.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

uploads are untrusted bytes; validate size/type/content independently; never trust filenames; store outside executable paths; scan/quarantine where required

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Bound size.
2. Stream to quarantine.
3. Inspect magic bytes where needed.
4. Generate safe object keys.
5. Apply malware scanning policy.
6. Publish only after validation.
7. Audit access.

## Failure modes

Avoid:

- trusting extension/MIME header; writing user filename to filesystem; processing uploads synchronously without bounds; serving quarantine objects directly.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
