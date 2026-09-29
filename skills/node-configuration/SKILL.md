---
name: node-configuration
description: Use when designing runtime configuration, environment variables, configuration schemas, validation, precedence, or safe startup behavior in Node.js services.
---

# Configuration

## Purpose
Make configuration explicit, runtime-validated, and safe to change across environments.

## Activate when
- Adding or changing environment variables or config files.
- Multiple sources can define the same setting.
- A service can start with incomplete or invalid configuration.

## Repository inspection
Inspect config loaders, environment access, startup sequence, deployment manifests, defaults, secret references, and configuration precedence.

## Decision rules
| Concern | Rule |
|---|---|
| Boundary | Parse and validate external configuration at one owned boundary. |
| Types | Runtime validation is required; TypeScript types do not validate environment input. |
| Precedence | Document deterministic precedence and avoid scattered process.env reads. |
| Defaults | Default only values with safe, intentional semantics. |
| Failure | Fail fast before serving traffic when required configuration is invalid. |

## Implementation procedure
1. Inventory configuration sources.
2. Define the canonical shape and precedence.
3. Parse unknown values into explicit runtime types.
4. Validate required and cross-field invariants.
5. Expose config through one owned boundary.
6. Test missing, invalid, and overridden values.

## Failure modes
- process.env is read throughout the codebase.
- "false" or "0" are interpreted incorrectly.
- Invalid production configuration is discovered after traffic arrives.
- Secrets are included in logs or diagnostics.

## Verification
Test parsing, precedence, invalid input, required settings, safe defaults, and startup failure behavior.