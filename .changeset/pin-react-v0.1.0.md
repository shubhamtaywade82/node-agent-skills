---
"node-agent-skills": minor
---

Pinned the `react-agent-skills` companion to its first immutable tag, `v0.1.0` (cut at `eb7758f` after the companion's RELEASE.md-gated verification), replacing the moving `main` pin — the same discipline the `ruby-agent-skills` companion already had. The cross-pack snapshot now records the tagged commit, and TODO.md closes the pinning follow-up (with an observed note that ruby has released `v1.6.0` while this pack pins `v1.5.0`). No skill, routing, or code changes; `bin/cross-pack-verify.mjs --companions ..` passes unchanged.
