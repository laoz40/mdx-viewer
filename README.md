# plan-viewer

Local MDX viewer for coding plans. No hosted UI, no per-project npm deps.

MDX components in `src/components/` follow the [visual-plan](https://github.com/BuilderIO/skills/tree/main/skills/visual-plan) block catalog from [BuilderIO/skills](https://github.com/BuilderIO/skills). See `examples/sample/plan.mdx` for a component demo.

## Setup

```bash
git clone <this-repo> plan-viewer
cd plan-viewer
pnpm install
```

### CLI

Symlink the bundled script onto your `PATH`:

```bash
ln -sf "$(pwd)/bin/plan-view" ~/.local/bin/plan-view
```

`plan-view` resolves this checkout from the script location. Set `PLAN_VIEWER_ROOT` if you symlink or copy it somewhere else.

Without the CLI:

```bash
export PLAN_FILE=/path/to/plan.mdx
pnpm dev
```

### Agent skill

For agents that load skills from `~/.agents/skills/` (Cursor, pi, etc.):

```bash
ln -sf "$(pwd)/skills/plan-mdx" ~/.agents/skills/plan-mdx
```

Source: [`skills/plan-mdx/SKILL.md`](skills/plan-mdx/SKILL.md). Tells agents how to author plan MDX and open plans with `plan-view`.

## Usage

From any project with `plans/<slug>/plan.mdx`:

```bash
plan-view plans/example
```

Environment:

- `PLAN_VIEWER_ROOT` — path to this checkout (required if the CLI is not colocated with the repo)
- `PLAN_PORT` — dev server port (default `5199`)
- `PLAN_OPEN=0` — do not open a browser tab

## MDX blocks

These tags match the visual-plan component set:

`Diff`, `AnnotatedCode`, `FileTree`, `Code`, `Callout`, `Checklist`, `Mermaid`, `Tabs` / `Tab`.

Component source: [`src/components/`](src/components/). Authoring contract: [`skills/plan-mdx/SKILL.md`](skills/plan-mdx/SKILL.md). Block reference: [visual-plan SKILL.md](https://github.com/BuilderIO/skills/blob/main/skills/visual-plan/SKILL.md).

## Attribution

MDX components in `src/components/` are adapted from [BuilderIO/skills](https://github.com/BuilderIO/skills) (MIT). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
