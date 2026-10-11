# Wave 14 — runtime diagnostics and compatibility

> Retrospective plan. The work was delivered on 2026-09-29.

**Goal:** Add 20 framework-neutral skills for module/package resolution, dependency integrity, runtime feature detection, process and memory diagnostics, event-loop analysis, telemetry safety, code generation, maintenance, compatibility, and runtime upgrades. Also adds the deterministic routing evaluator.

**Architecture:** Runtime diagnostics skills own the "observe the Node process in production" boundary. The routing evaluator (`lib/routing-evaluator.mjs`) is the deterministic harness that scores agent routing decisions against the corpus.

**Tech Stack:** Node.js 24+, TypeScript, `--cpu-prof`, `--heap-prof`, `monitorEventLoopDelay`, OpenTelemetry, telemetry sampling, semantic versioning, runtime feature detection.

**Spec:** `docs/superpowers/specs/2026-09-28-node-agent-skills-design.md`.

## Global Constraints

- Core skills remain framework-neutral.
- Adapters require repository/version detection.
- A RED contract test gates registry/evaluation/adapter completeness.
- No skill exceeds 500 lines.
- The evaluator fails closed for missing decisions, unknown case IDs, malformed JSON, mismatched primary, forbidden/unknown skills, and missing/incorrect adapters.

## Review Focus

- File-descriptor lifecycle: `lsof -p <pid>` shows no leaked handles after request.
- Heap diagnostics: `--heap-prof` for 10 min; inspect for allocation hot spots.
- Event-loop diagnostics: `monitorEventLoopDelay` < 5ms p99 under load.
- Memory leak diagnostics: heap growth bounded; GC pause < 100ms.
- Process supervision: PID 1 in container; signals trapped; no zombie orphans.
- Runtime feature detection: detect via `process.features` and `navigator.userAgent`, not version sniffing.
- Runtime upgrade planning: deprecation warnings; breaking changes; staged rollout.
- Source-map governance: source maps in dev, hidden in prod.
- Build-cache integrity: reproducible from lockfile; hash-pinned deps.
- Change-log integrity: append-only; semver-aligned; no silent breaks.
- Maintenance engineering: scheduled dependency upgrades; security patches first.
- Backward-compatibility testing: contract tests on the supported-version matrix.
- Deprecation planning: announce, deprecate, remove — three releases.
- Legacy modernization: strangler-fig; no big-bang.
- Documentation engineering: docs match current behavior; drift detected.

## Tasks

### Task 1: Module + dependency + runtime detection
- Created `skills/node-module-resolution-diagnostics/SKILL.md`, `skills/node-runtime-feature-detection/SKILL.md`, `skills/node-dependency-upgrades/SKILL.md`, `skills/node-deprecation-planning/SKILL.md`, `skills/node-deprecation-management/SKILL.md`.

### Task 2: Process + memory + event loop
- Created `skills/node-process-supervision/SKILL.md`, `skills/node-heap-diagnostics/SKILL.md`, `skills/node-event-loop-diagnostics/SKILL.md`, `skills/node-memory-leak-diagnostics/SKILL.md`, `skills/node-file-descriptor-lifecycle/SKILL.md`, `skills/node-worker-crash-recovery/SKILL.md`, `skills/node-runtime-health-monitoring/SKILL.md`, `skills/node-runtime-inspector-security/SKILL.md`, `skills/node-startup-profiling/SKILL.md`, `skills/node-diagnostic-reports/SKILL.md`.

### Task 3: Telemetry + maintenance + compat
- Created `skills/node-telemetry-sampling/SKILL.md`, `skills/node-trace-context-propagation/SKILL.md`, `skills/node-source-map-governance/SKILL.md`, `skills/node-maintenance-engineering/SKILL.md`, `skills/node-backward-compatibility-testing/SKILL.md`, `skills/node-runtime-upgrade-planning/SKILL.md`, `skills/node-build-cache-integrity/SKILL.md`, `skills/node-change-log-integrity/SKILL.md`, `skills/node-legacy-modernization/SKILL.md`, `skills/node-documentation-engineering/SKILL.md` (deepened), `skills/node-developer-experience/SKILL.md`.

### Task 4: Routing evaluator
- Created `lib/routing-evaluator.mjs` (290 lines): YAML/JSONL parser, corpus validator, decision evaluator, summary reporter.
- Exports: `parseRoutingCases`, `validateRoutingCorpus`, `parseRoutingDecisions`, `evaluateRoutingCase`, `summarizeRoutingResults`.
- Created `scripts/evaluate-routing.mjs`: CLI wrapper.
- Created `evals/README.md`: protocol documentation.

### Task 5: Routing + evaluation coverage
- Added routing cases in `router/ROUTING_CASES.yml` for every new skill.
- Added 24 evaluation cases in `evals/cases/runtime-diagnostics-compatibility/workflow.yml`.
- Added `test/wave14_contract.test.mjs`, `test/routing_evaluator.test.mjs`, `test/routing_evaluator_cli_contract.test.mjs`, `test/routing_evaluator_adapter_contract.test.mjs`, `test/routing_evaluator_repo_corpus_contract.test.mjs`, `test/routing_evaluator_summary_contract.test.mjs`, `test/routing_corpus_validation_contract.test.mjs`, `test/routing_decision_parser_contract.test.mjs`, `test/routing_cases.test.mjs`, `test/agent_evaluation_routing_integration_contract.test.mjs`.

## Completion gate

- `npm test` ✓ (routing evaluator has 9 dedicated test files)
- `npm run validate` ✓
- Routing/evaluation coverage ✓
- Deterministic JSON reports for routing accuracy and explicit failures ✓
