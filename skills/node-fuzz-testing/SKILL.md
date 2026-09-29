---
name: node-fuzz-testing
description: Use when exposing parsers, protocol handlers, HTTP endpoints, decoders, or other Node.js boundaries to malformed, adversarial, or unexpected input at high volume.
---

# Fuzz Testing

## Purpose
Find crashes, hangs, resource exhaustion, and invariant violations that ordinary examples miss.

## Activate when
- Parsing untrusted structured or binary input.
- Processing protocol formats.
- Reliability requires bounded behavior on malformed input.

## Repository inspection
Inspect parser entrypoints, resource limits, timeout/cancellation behavior, crash handling, corpus storage, and existing property/integration tests.

## Decision rules
| Concern | Rule |
|---|---|
| Oracle | Define no-crash, no-hang, resource-bound, and invariant properties first. |
| Bounds | Bound input size, time, memory, and concurrent fuzz cases. |
| Corpus | Retain minimized failing inputs as regression fixtures. |
| Isolation | Avoid production credentials and destructive side effects. |
| Coverage | Measure useful path discovery, not only input volume. |

## Implementation procedure
1. Select a narrow fuzz target.
2. Define safety and resource oracles.
3. Seed valid, boundary, and malformed inputs.
4. Fuzz within bounded resources.
5. Minimize and persist failures.
6. Add regressions and deterministic CI smoke fuzzing.

## Failure modes
- Fuzzing real endpoints with side effects.
- Hung inputs stall CI.
- Discovered failures are not retained.
- The harness itself becomes the resource bottleneck.

## Verification
Demonstrate bounded execution, crash/hang detection, retained counterexamples, and deterministic regression coverage.