---
"node-agent-skills": minor
---

Cross-pack integration v3: manifest schema_version 3 with cross_pack section (companions, collision registry, seam contracts), structural fix of the malformed `adapters:` YAML block, the `node-ruby-integration` seam skill, language-aware routing (activeFile boost/demote), the `route_cross_pack` MCP tool + `cross-route` CLI, shared parsers (`lib/cross-pack-manifest.mjs`), a zero-dep v3 schema validator (`lib/v3-schema.mjs`), and the rewritten `bin/cross-pack-verify.mjs`. Zero breaking changes: `routePrompt`/`parseManifest`/CLI/MCP surfaces are strict supersets.
