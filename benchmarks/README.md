# Benchmarks

Benchmark harness for fixture/campaign-based coverage measurement. This is
deliberately separate from the public evaluation corpus (`evals/`): eval cases
measure routing correctness (which skill a prompt should land on); benchmarks
measure end-to-end agent behavior on executable fixtures under controlled
conditions.

## Contract

Mirrors AGENTS.md ("Benchmark integrity" and "Evaluation and benchmark changes"):

- The public evaluation corpus (`evals/`) and benchmark-measured
  fixture/campaign coverage are distinct surfaces. A benchmark result never
  mutates eval-case expectations, and eval-case changes never claim benchmark
  coverage.
- Fixture roots and implementation/test seams are validated before a campaign
  is treated as executable. The current executable fixture seam is `examples/`
  (`ecommerce-api`, `edge-worker`), exercised by the Validate workflow's smoke
  tests (adapter detection, routing, and pack-export checks).
- Every aggregate result records: campaign version, source corpus, fixture
  identity, verifier identity, execution controls, and coverage provenance.
- Hidden and adversarial benchmark cases stay OUT of the public repository;
  they follow the same evaluation/result protocol locally and are referenced
  here only by version and provenance, never by content.

## Campaign registry (`manifest.yml`)

Campaigns are registered in `manifest.yml` against an executable fixture.
`campaigns:` is intentionally empty — no campaign has been recorded yet. A
recorded campaign lands in `agent-recordings/` following the recording format
documented there, and its entry in `manifest.yml` pins: campaign version,
source corpus, fixture identity, execution controls, and the recording set it
produced.
