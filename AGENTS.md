# mdx-viewer

Global MDX viewer with React components for rich documents.

Components render MDX in the browser. `mdxv` builds a self-contained HTML file or serves it over HTTP.

Keep the implementation as minimal as possible. Always suggest more simple implementation if possible.

## Authoring (for agents editing this repo)

mdx-viewer is not plan-only. MDX here is for any visual document: plans, teaching material, walkthroughs, demos, etc.

When editing docs, the mdx skill, CLI help, or examples, do not imply plan-only usage. Use neutral language ("MDX file", "document", "path") and vary examples (`docs/guide.mdx`, `plans/foo/plan.mdx`).

## Layout

- `src/components/` — MDX block components
- `scripts/serve.mjs` — build and serve
- `bin/mdxv` — CLI
- `skills/mdx/` — agent authoring skill

## Verify changes

Lint and format after each change.
Run benchmarks when appropriate to ensure bundle size or build time stays reasonable.
