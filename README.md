# mdx-planner

Local MDX viewer for rich documents (plans, guides, walkthroughs, demos). No hosted UI, no per-project npm deps.

MDX components in `src/components/` follow the [visual-plan](https://github.com/BuilderIO/skills/tree/main/skills/visual-plan) block catalog from [BuilderIO/skills](https://github.com/BuilderIO/skills). See `example/example.mdx` for a component demo.

## Setup

```bash
git clone <this-repo> mdx-planner
cd mdx-planner
pnpm install
```

### CLI

Symlink the bundled script onto your `PATH`:

```bash
ln -sf "$(pwd)/bin/mdxv" ~/.local/bin/mdxv
```

`mdxv` resolves this checkout from the script location. Set `MDXV_ROOT` if you symlink or copy it somewhere else.

Without the CLI:

```bash
export MDXV_FILE=/path/to/document.mdx
pnpm dev
```

### Agent skill

For agents that load skills from `~/.agents/skills/` (Cursor, pi, etc.):

```bash
ln -sf "$(pwd)/skills/mdx" ~/.agents/skills/mdx
```

Source: [`skills/mdx/SKILL.md`](skills/mdx/SKILL.md). Tells agents how to author MDX and open it with `mdxv`.

## Usage

From any project with an MDX file:

```bash
mdxv docs/guide.mdx                       # build guide.html, open in browser
mdxv --no-open plans/example/plan.mdx     # build only, print output path
mdxv --port 5199 docs/guide.mdx           # localhost server for Tailscale Serve
mdxv --serve -p 5200 docs/guide.mdx       # direct bind on all interfaces
```

Options:

- `--port PORT` — build and serve on `127.0.0.1` (keeps running; use with Tailscale Serve)
- `--serve` — build and serve on `0.0.0.0` (direct bind for LAN/Tailscale IP)
- `-p, --port PORT` — port for `--serve` (default `5199`)
- `--no-open` — skip opening a browser tab

Environment (optional overrides):

- `MDXV_ROOT` — path to this checkout (required if the CLI is not colocated with the repo)
- `MDXV_PORT` — default port for `--serve` when `-p` is not set
- `MDXV_OPEN` — default open behavior when `--no-open` is not set

## MDX blocks

These tags match the visual-plan component set:

`Diff`, `FileTree`, `Code`, `Callout`, `Mermaid`, `Tabs` / `Tab`.

Component source: [`src/components/`](src/components/). Authoring contract: [`skills/mdx/SKILL.md`](skills/mdx/SKILL.md). Block reference: [visual-plan SKILL.md](https://github.com/BuilderIO/skills/blob/main/skills/visual-plan/SKILL.md).

## Attribution

MDX components in `src/components/` are adapted from [BuilderIO/skills](https://github.com/BuilderIO/skills) (MIT). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
