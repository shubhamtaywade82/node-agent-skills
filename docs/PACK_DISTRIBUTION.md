# Pack distribution

This repository follows the portable Agent Skills model: each capability is a directory with a `SKILL.md` entrypoint, and supporting resources may live beside it. The current ecosystem specification emphasizes vendor-neutral SKILL.md folders and progressive disclosure. See https://agentskills.io/specification.

## Export

Run:

```bash
npm run pack:export
```

The default output is `dist/node-agent-skills/`.

For a custom output path:

```bash
node scripts/export-pack.mjs --output /tmp/node-agent-skills
```

The export contains the portable skills, adapters, manifest, router, license, and documentation. `pack-manifest.json` records the pack name, version, source revision, skill count, adapter count, and included file list. `checksums.sha256` contains SHA-256 digests for all exported source files.

## Installation

Copy or link the exported skill directories into a compatible Agent Skills lookup location supported by the target agent. Keep the portable `SKILL.md` structure unchanged. Do not mix vendor-specific instructions into the core skills; use adapter or compatibility documentation when a client requires a different lookup path.

## Release discipline

Export only from a verified revision. Run `npm test` and `npm run validate` before distribution. Treat the exported manifest and checksums as derived artifacts, not hand-edited source.
