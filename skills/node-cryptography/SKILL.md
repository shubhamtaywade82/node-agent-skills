---
name: node-cryptography
description: Use when passwords, signatures, tokens, encrypted fields, hashes, keys, nonces, or integrity checks are involved.
---

# Application Cryptography

## Purpose

using cryptographic primitives safely at application boundaries.

## Activate when

- passwords, signatures, tokens, encrypted fields, hashes, keys, nonces, or integrity checks are involved.
- The task crosses a boundary where repository conventions matter.
- The change needs explicit failure and verification semantics.

## Repository inspection

1. Read package manager, lockfile, Node.js/TypeScript versions, entrypoints, scripts, CI, config, and neighboring tests.
2. Identify the current owner of the behavior and its public contract.
3. Reuse existing primitives before creating new abstractions.

## Decision rules

prefer maintained libraries and platform primitives; distinguish hashing, encryption, MACs, and signatures; use CSPRNG; compare secrets in constant time when appropriate; rotate keys

## Implementation procedure

1. Define security goal.
2. Choose primitive appropriate to goal.
3. Generate/store keys safely.
4. Encode metadata/version.
5. Separate key identifiers from ciphertext.
6. Test rotation and invalid inputs.
7. Document algorithm choices.

## Failure modes

Avoid:

- inventing crypto; static IV/nonce; hard-coded keys; plaintext secret storage; ordinary equality for timing-sensitive secret comparison.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.

See references/agent-discipline.md for the shared lines that were removed from this section.
