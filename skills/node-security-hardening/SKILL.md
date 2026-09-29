---
name: node-security-hardening
description: Use when hardening a Node.js service against unsafe input, prototype pollution, SSRF, unsafe deserialization, process misuse, dependency abuse, or privilege escalation.
---

# Security Hardening

## Purpose
Reduce attack surface at input, network, parser, dependency, and process boundaries.

## Activate when
- Adding an internet-facing endpoint or integration.
- Accepting URLs, files, serialized data, templates, or dynamic code.
- Changing process privileges or runtime security controls.

## Repository inspection
Inspect trust boundaries, parser behavior, URL handling, file system access, child-process usage, dependency versions, headers, permissions, and error exposure.

## Decision rules
| Concern | Rule |
|---|---|
| Input | Validate untrusted input before interpretation or use. |
| SSRF | Restrict outbound targets by policy; do not trust user-supplied URLs by default. |
| Process | Avoid shell execution and dynamic evaluation; prefer direct argument APIs. |
| Privilege | Run with the minimum OS/container privileges required. |
| Errors | Return safe client errors while retaining useful server-side evidence. |
| Runtime controls | Use Node security controls for concrete threats and verify compatibility first. |

## Implementation procedure
1. Enumerate attacker-controlled inputs and dangerous sinks.
2. Define schemas, allowlists, and capability boundaries.
3. Remove unnecessary process, file, and network privileges.
4. Harden parser, serialization, and outbound request behavior.
5. Add abuse and negative-path tests.
6. Review dependencies and runtime configuration.

## Failure modes
- Validation checks types but not allowed destinations or permissions.
- User input reaches shell commands or unsafe filesystem paths.
- Errors expose tokens, SQL, internal paths, or stacks.
- Security controls break legitimate workloads because compatibility was assumed.

## Verification
Test malicious and boundary inputs, outbound-target restrictions, privilege assumptions, safe errors, and runtime hardening.