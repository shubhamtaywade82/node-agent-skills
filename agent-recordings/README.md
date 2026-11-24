# Agent recordings

Recorded agent runs used for regression comparison: the same task, the same
fixture workspace, run with and without skill content, compared on the
recording's files. The directory intentionally contains no recordings yet —
this document is the format contract the recording runner fills.

## Layout

One directory per campaign recording set, mirroring the cross-pack convention
(ruby-agent-skills `agent-recordings/recorded-model-campaign-v1/`):

```
agent-recordings/
  <recording-set-name>/
    recording-set.yml            # index: set name, campaign, cases, provenance
    <case-name>/
      baseline/recording.json    # run WITHOUT skill content
      skills/recording.json      # run WITH skill content routed in
```

## `recording.json` schema

```json
{
  "recording_schema_version": 1,
  "recording_set": "<set name>",
  "evaluation": "<case name>",
  "configuration": "baseline | skills",
  "agent": { "provider": "...", "model": "...", "model_version": null, "tool_mode": "..." },
  "context_note": "what context the run materialized; which content was consumed",
  "context_fingerprint": {
    "prompt_sha256": "...",
    "workspace": { "<fixture file>": "<sha256>" },
    "skills": ["<skill names routed in, empty for baseline>"],
    "patterns": []
  },
  "files": { "<path>": "<full file content produced by the run>" }
}
```

Provenance rules:

- `context_fingerprint` pins the exact inputs (prompt, workspace files,
  skill/pattern content by hash) so a later re-run can prove it compared the
  same thing.
- The baseline/skills pair is the regression signal: differences in `files`
  attributable to skill content, compared case by case.
- Recordings are data, never code: nothing in the repository executes them at
  validation time. A future benchmark campaign (see `benchmarks/manifest.yml`)
  references a recording set by name and version.
