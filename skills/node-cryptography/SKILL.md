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

- Prefer the smallest design that makes ownership, failure, and observability explicit.
- Detect exact dependency versions before using version-specific APIs.
- Treat external input and resource state as untrusted runtime data.
- Preserve existing contracts unless the task explicitly changes them.

## Implementation procedure

1. Define security goal.\n2. Choose primitive appropriate to goal.\n3. Generate/store keys safely.\n4. Encode metadata/version.\n5. Separate key identifiers from ciphertext.\n6. Test rotation and invalid inputs.\n7. Document algorithm choices.

## Failure modes

Avoid:

- inventing crypto; static IV/nonce; hard-coded keys; plaintext secret storage; ordinary equality for timing-sensitive secret comparison.
- Hidden coupling, unbounded resource use, or silent fallback.
- Tests that prove implementation details instead of the observable contract.

## Verification

1. Add or update focused tests before implementing behavior changes.
2. Verify failure paths, cleanup, and compatibility behavior.
3. Run focused tests, then the full repository test suite.
4. Run lint/typecheck/build/deployment gates defined by the repository.
5. Record assumptions, risks, and rollback implications.
