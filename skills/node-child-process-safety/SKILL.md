---
name: node-child-process-safety
description: Use when a backend needs ffmpeg, git, shell utilities, migrations, or other external processes.
---

# Child Process Safety

## Purpose

executing system commands or subprocesses without injection, path, environment, or resource-safety vulnerabilities.

## Activate when

- a backend needs ffmpeg, git, shell utilities, migrations, or other external processes.
- The change crosses a runtime, security, resource, or request-boundary concern.

## Repository inspection

1. Detect Node.js/TypeScript version, framework, package manager, deployment model, and test commands.
2. Inspect the relevant process, HTTP, storage, cache, or security boundary.
3. Locate existing lifecycle, cancellation, authorization, and observability behavior.
4. Confirm exact dependency versions before using adapter-specific APIs.

## Decision rules

prefer direct executable + argument arrays over shell strings; validate inputs; restrict cwd/env; bound runtime/output; kill process groups on cancellation

- Treat all external input as untrusted runtime data.
- Keep resource usage bounded and cleanup explicit.
- Preserve tenant and authorization boundaries through retries, caches, async work, and failures.
- Prefer platform primitives over custom concurrency/security mechanisms.

## Implementation procedure

1. Identify executable trust.
2. Pass arguments without shell interpolation.
3. Set cwd/env allowlist.
4. Enforce timeout/output limits.
5. Propagate abort.
6. Capture exit status.
7. Test malicious arguments.

## Failure modes

Avoid:

- exec with concatenated user input; PATH-dependent surprises; inherited secrets; orphaned children; unbounded stdout/stderr.
- Hidden global mutable state or unbounded resource creation.
- Assuming compile-time types or framework defaults provide security guarantees.

## Verification

1. Add a failing regression/contract test before behavior changes.
2. Exercise boundary, failure, cancellation, and abuse cases relevant to the skill.
3. Run focused tests and the full suite.
4. Verify resource cleanup and telemetry.
5. Review the final diff for security and compatibility regressions.
