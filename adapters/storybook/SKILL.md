---
name: storybook
description: Use when a Node.js project uses Storybook for component isolation, interaction testing, or visual regression.
---

# Storybook Adapter

## Purpose

Translate the framework-neutral testing contract onto Storybook, where `*.stories.tsx` files isolate components for visual review, interaction testing, accessibility audit, and visual regression.

## Activate when

- Detect `storybook` in devDependencies.
- See `.storybook/main.ts` and `.storybook/preview.ts` at the repo root.

## Repository inspection

1. `package.json` — `storybook` version, `@storybook/react-vite` / `@storybook/nextjs` / `@storybook/vue3-vite`.
2. `.storybook/main.ts` — `stories`, `addons` (`@storybook/addon-essentials`, `@storybook/addon-interactions`).
3. `.storybook/preview.ts` — `parameters`, `globalTypes` (theme, locale), decorators (providers).
4. Stories — `*.stories.tsx` co-located with components or in `stories/`.
5. Interactions — `play` functions, `@storybook/test` for assertions.
6. Visual regression — `@storybook/addon-a11y`, `@storybook/addon-coverage`. Chromatic for visual diffs.

## Decision rules

| Concern | Rule |
|---|---|
| Story file | `export default { component, title, args }`. `StoryObj` typed. |
| Args | Pass props via `args`. Use `argTypes` to control inputs (select, range, color). |
| Composition root | Decorators for providers (Router, Theme, QueryClient). One decorator per provider. |
| Play functions | `play: async ({ canvasElement, args }) => { ... }`. Use `@storybook/test` (`expect`, `userEvent`). Test interactions, not implementation. |
| Stories | One `Default` story + named stories per variant (`Loading`, `Error`, `Empty`, `WithLongText`). |
| Docs | `autodocs: true` in `parameters.docs`. Use `tags: ["autodocs"]`. |
| A11y | `@storybook/addon-a11y` runs on every story. Fix violations before merge. |
| Visual regression | Chromatic for snapshot diffs. Bound the snapshot count to avoid cost. |
| Coverage | `@storybook/addon-coverage` for interaction test coverage. |
| Mock | `mswDecorators` (via `msw-storybook-addon`) for API mocking. |
| Build | `storybook build` for static hosting. `storybook dev` for local. |

## Implementation procedure

1. Detect the Storybook version. Read `.storybook/main.ts` for addons.
2. Configure `.storybook/preview.ts` with global decorators (Router, Theme, QueryClient).
3. Write one `Default` story per component plus named variants for edge cases.
4. Add `play` functions for interactions using `@storybook/test`.
5. Enable `@storybook/addon-a11y`; fix violations.
6. Wire Chromatic for visual regression in CI.
7. Add `storybook build` to CI for static docs.

## Failure modes

- Story with hardcoded props → does not reflect real variants.
- Provider missing in decorator → component crashes in story.
- A11y violation ignored → ships to production.
- Play function tests implementation (state) instead of interaction → brittle, breaks on refactor.
- No `Default` story → docs page broken.
- Story imports the component via relative path → breaks on file move.
- Storybook build fails silently in CI → no docs update.

## Verification

- Run `storybook dev`; confirm every story renders.
- Run `storybook build`; confirm static build succeeds.
- Trigger a11y on each story; confirm zero violations.
- Run a play function; confirm interaction assertion.
- Inspect `storybook-static/` for the build output.
- Confirm Chromatic CI runs on PRs with visual diffs surfaced.
- Source references: https://storybook.js.org/docs, https://storybook.js.org/docs/essentials/accessibility, https://storybook.js.org/docs/writing-tests/interaction-testing, https://www.chromatic.com/docs/, https://storybook.js.org/docs/api/doc-block-story.
