---
"node-agent-skills": minor
---

Consolidation of overlapping skill clusters per the issue #42 ownership decisions: 16 near-duplicate skills retired (338 → 322). Read replicas (3 → 1, owner `node-database-read-replicas`), outbox (2 → 1, owner `node-transactional-outbox`), deprecation (3 → 1, owner `node-api-deprecation`), migrations (3 → 1, owner `node-migrations`, which absorbed the production-runbook mechanics), and skill-pack governance (12 → 3: `node-skill-packaging` author side, `node-skill-pack-installation` consumer side, `node-skill-pack-manifest-governance` governance side). The seven surviving owners were enriched to the band depth baseline with the absorbed guidance; manifest triggers, routing cases, eval corpora, and wave-contract count assertions were re-pointed in the same change. No routing case lost its scenario; every case keeps exactly one primary.
