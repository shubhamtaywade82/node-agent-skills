---
name: node-supply-chain
description: Use when managing npm dependencies, lockfiles, package provenance, dependency vulnerabilities, install scripts, reproducible builds, or software supply-chain controls for Node.js projects.
---

# Supply-Chain Security

## Purpose
Make dependency and build inputs reviewable, reproducible, and resistant to accidental or malicious changes.

## Activate when
- Adding, upgrading, or removing dependencies.
- Using private registries or publishing packages.
- Hardening CI installs and release workflows.

## Repository inspection
Inspect package manager, lockfile, registry configuration, lifecycle scripts, CI permissions, provenance, dependency policy, audit tooling, and generated artifacts.

## Decision rules
| Concern | Rule |
|---|---|
| Lockfile | Keep the authoritative lockfile and use clean/immutable installs in CI where supported. |
| Provenance | Prefer registry provenance or attestation mechanisms over long-lived publish tokens where supported. |
| Scripts | Treat install and lifecycle scripts as executable supply-chain inputs. |
| Updates | Review source, changelog, lockfile diff, and transitive impact. |
| CI | Give publish workflows narrow permissions and credentials. |
| Reproducibility | Promote the exact artifact that was built and tested. |

## Implementation procedure
1. Identify package-manager and registry trust boundaries.
2. Pin and verify dependency resolution.
3. Minimize install/build privileges.
4. Run vulnerability and policy checks.
5. Produce immutable release artifacts with provenance where possible.
6. Document and review exceptions.

## Failure modes
- CI silently rewrites the lockfile.
- A dependency update changes large parts of the graph without review.
- Publishing uses broad long-lived tokens.
- Production hotfixes cannot be reproduced from source state.

## Verification
Verify clean immutable installs, reviewed lockfile changes, vulnerability policy, publish permissions, artifact identity, and provenance.