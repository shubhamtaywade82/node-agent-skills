---
name: node-api-deprecation
description: Use when an endpoint, field, parameter, header, API version, configuration key, or dependency is being deprecated or phased out, and the removal needs a migration path and compatibility window.
---

# API Deprecation

## Purpose

Deprecation is a contract change, not an internal refactor: consumers — including clients you cannot see, generated artifacts, and operator tooling — have a dependency on the current behavior. Retire behavior in phases with an explicit compatibility window, measured usage, and a documented migration path, and anchor the removal plan to releases so the timeline is observable from the outside. Remove only after evidence, never on a schedule that ignores it.

## Activate when

- An endpoint, field, parameter, header, or API version is being deprecated or removed.
- A configuration key, environment variable, or public constant needs phased removal.
- A dependency migration forces a deprecation of a wrapper, adapter, or exported surface.
- A sunset needs to be planned and communicated as part of a release.

## Boundary with related skills

- Use `node-change-log-integrity` for recording the deprecation in release metadata.
- Use `node-api-versioning` when the deprecation rides on a version bump rather than in-place removal.
- Use `node-backward-compatibility-testing` for contract tests that pin old and new behavior during the window.
- Use `node-migrations` when the deprecated surface is backed by schema or stored data.

## Repository inspection

1. Detect runtime/package-manager/version constraints, repository architecture, CI, and test commands.
2. Inspect the current owner and all obvious consumers of the changed contract — code, generated clients, SDKs, dashboards, operator docs.
3. Locate configuration, generated artifacts, migrations, operational documentation, and neighboring tests that reference the surface.
4. Check whether usage can be measured today (per-client-version metrics, logs) or instrumentation must be added first.

## Decision rules

| Concern | Rule |
|---|---|
| Contract status | A deprecation without a migration path is a breaking change, not a deprecation. |
| Compatibility window | Ship old and new side by side; overlap is measured in release cycles, and the window is stated publicly. |
| Usage evidence | Instrument usage per consumer/version before removal; server error rates alone do not measure consumers. |
| Phased removal | Deprecate → warn → dual-read → remove; each phase ships separately and is reversible. |
| Release anchoring | Every phase is announced in release notes/changelog with a concrete sunset release or date. |
| Generated clients | Regenerate and test generated artifacts before, not after, the contract change. |

## Implementation procedure

1. Identify consumers: grep the repo, check generated artifacts, find operator tooling and external integrations.
2. Add deprecation metadata where the platform supports it (`@deprecated` JSDoc/OpenAPI `deprecated: true`, response header, log line on use).
3. Instrument usage with enough dimensionality (caller, client version) to prove when the window can close.
4. Document the migration path next to the deprecated surface: what replaces it, how to move, what breaks on the sunset date.
5. Ship the dual-read/dual-write period; keep old and new behavior covered by contract tests.
6. Announce each phase in the release notes with the sunset target.
7. Gate removal on evidence: usage at (or effectively) zero for the window; keep a named owner for the removal PR.

## Failure modes

- Silent removal — the surface disappears in a minor release with no warning phase.
- Deprecation with no migration path — consumers are told what stops working but not what to use instead.
- Measuring only server errors — a removed field read by clients produces client-side breakage invisible in server 5xx rates.
- Breaking generated clients unexpectedly — the OpenAPI/GraphQL schema changed without regenerating and testing downstream artifacts.
- The compatibility window closes on a calendar date while usage telemetry shows real traffic.
- Configuration keys removed in the same release that stops honoring them — consumers get neither warning nor fallback.
- Tests only exercise the happy path of the new surface, so the overlap period is untested.

## Verification

1. Establish or extend deterministic tests before changing behavior: old surface and new surface coexist during the window.
2. Verify the deprecation signal is observable (metadata emitted, warning logged, header sent) and the migration path compiles/runs as documented.
3. Simulate a consumer still using the deprecated surface at window end; confirm behavior and the removal gate.
4. Run focused tests and the full repository suite; run build/typecheck/lint/deployment gates.
5. Record evidence, residual risk, and operator-facing follow-up (docs, changelog entries, sunset notes).
