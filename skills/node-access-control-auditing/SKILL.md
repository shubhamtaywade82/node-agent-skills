---
name: node-access-control-auditing
description: Use when privileged access, permission changes, or denied sensitive actions require auditable evidence.
---

# Access Control Auditing

## Purpose

Record security-relevant authorization decisions for traceability without leaking credentials or sensitive payloads.

## Activate when

- Privileged access, permission changes, or sensitive denied actions require audit evidence.
- Audit records may cross service, tenant, or retention boundaries.

## Repository inspection

1. Detect Node.js/TypeScript version, authorization model, audit storage, and logging stack.
2. Locate the policy decision point and existing audit/event schemas.
3. Identify tenant, actor, resource, retention, and privacy boundaries.
4. Confirm whether audit evidence must be immutable, append-only, or externally retained.

## Decision rules

- Audit events should identify actor, action, resource, decision, correlation context, and timestamp without storing secrets.
- Authorization remains the source of truth; audit records are evidence, not a permission mechanism.
- Privileged changes deserve stronger integrity and retention guarantees than ordinary diagnostics.
- Audit volume must remain bounded and searchable.

## Implementation procedure

1. Define the audit event schema.
2. Identify mandatory privileged allow and deny events.
3. Capture the authorization outcome after policy evaluation.
4. Attach trusted correlation and tenant context.
5. Persist through an append-oriented path with explicit retention.
6. Redact tokens, credentials, and unnecessary payload data.
7. Test missing, denied, cross-tenant, and privileged-change audit cases.

## Failure modes

Avoid:

- Logging authorization tokens or full sensitive request payloads.
- Allowing audit records to be silently overwritten.
- Treating audit logging as a substitute for authorization.
- Emitting unbounded high-cardinality audit dimensions.

## Verification

1. Add a failing audit-contract test first.
2. Verify privileged allow/deny cases and tenant boundaries.
3. Confirm redaction and retention behavior.
4. Run focused tests and full repository gates.
5. Review the final diff for evidence integrity and data leakage.
