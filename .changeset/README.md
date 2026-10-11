# Changesets

This repository uses [Changesets](https://github.com/changesets/changesets) to track per-skill and per-pack version bumps.

## When to add a changeset

Add a changeset when you change a skill's contract (frontmatter, sections, decision rules, verification) or the pack runtime (`lib/`, `bin/`). Trivial fixes (typos, blank lines, escape bugs) still get a changeset — `patch` bump.

## How to add a changeset

```bash
npx changeset
```

This opens an interactive prompt. Choose:
- **patch** — bug fixes, escape-sequence fixes, typo corrections
- **minor** — new sections, new decision rules, new code samples
- **major** — removed sections, renamed skills, breaking contract changes

The changeset file is written to `.changeset/` with a random name. Commit it alongside your change.

## Release flow

1. PRs are merged with their changeset files.
2. A Release PR (opened by `actions/changesets`) collects all pending changesets and bumps versions in `skill-manifest.yml`, `package.json`, and `CHANGELOG.md`.
3. Merge the Release PR to publish.

## Manual fallback

If the changesets workflow is unavailable, run:

```bash
node scripts/add-skill-versions.mjs   # idempotent — adds version: 0.1.0 to skills missing the field
npm run validate                       # confirm manifest consistency
```

Then manually update `package.json` `version` and add a `CHANGELOG.md` entry.

## Per-skill version contract

- Every skill in `skill-manifest.yml` MUST have a `version:` field.
- The `scripts/validate.mjs` validator does not yet enforce this; the test in `test/per_skill_version_contract.test.mjs` does.
- New skills default to `version: 0.1.0`.
