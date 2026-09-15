# mdx-viewer

Global MDX viewer for rich documents. No hosted UI, no per-project npm deps.

MDX components in `src/components/` follow the [visual-plan](https://github.com/BuilderIO/skills/tree/main/skills/visual-plan) block catalog from [BuilderIO/skills](https://github.com/BuilderIO/skills). See `example/example.mdx` for a component demo.

## Setup

```bash
npm install -g mdx-viewer
mdxv setup
```

`mdxv setup` symlinks the agent skill to `~/.agents/skills/mdx` and checks that `mdxv` is on PATH.

## Usage

From any project with an MDX file:

```bash
mdxv docs/guide.mdx                       # build to cache, open in browser
mdxv docs/guide.mdx -o docs/guide.html    # explicit output path
mdxv --no-open docs/guide.mdx             # build only, print output path
mdxv --port 5199 docs/guide.mdx           # serve on localhost
mdxv --serve -p 5200 docs/guide.mdx       # serve on all interfaces
mdxv --components                         # print component source directory
mdxv setup                                # re-run skill symlink + PATH check
```

By default, HTML is written to the user cache under `$XDG_CACHE_HOME/mdxv/` (with fallbacks documented in the CLI). Use `-o` for an explicit path.

Commands and options:

- `setup` — symlink skill, check PATH, print component source path
- `--components` — print path to bundled component source (for agents)
- `-o, --output PATH` — write HTML to an explicit path
- `--port PORT` — build and serve on localhost
- `--serve` — build and serve on all interfaces
- `-p, --port PORT` — port when serving (default `5199`)
- `--no-open` — skip opening a browser tab

Environment (optional overrides):

- `MDXV_ROOT` — path to the viewer install
- `MDXV_PORT` — default port when serving
- `MDXV_OPEN` — default open behavior when `--no-open` is not set

## MDX blocks

These tags match the visual-plan component set:

`Diff`, `FileTree`, `Code`, `Callout`, `Mermaid`, `Tabs` / `Tab`.

Run `mdxv --components` for the bundled component source path. Authoring contract: [`skills/mdx/SKILL.md`](skills/mdx/SKILL.md). Block reference: [visual-plan SKILL.md](https://github.com/BuilderIO/skills/blob/main/skills/visual-plan/SKILL.md).

## Attribution

MDX components in `src/components/` are adapted from [BuilderIO/skills](https://github.com/BuilderIO/skills) (MIT). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
