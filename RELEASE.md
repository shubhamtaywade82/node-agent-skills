# Release Process

1. Update CHANGELOG.md with only implemented changes.
2. Ensure the manifest, routing, tests, evaluations, and README inventory agree.
3. Run `npm test` and `npm run validate`.
4. Inspect GitHub Actions results on the release commit.
5. Tag the release only after observed verification.
