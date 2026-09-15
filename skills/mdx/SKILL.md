---
name: mdx
description: Write structured MDX documents with custom components for visual explanations and rich docs. Use when authoring MDX for the mdx-viewer.
---

# Create MDX

## Setup

```bash
npm install -g mdx-viewer
mdxv setup
```

`mdxv setup` symlinks this skill to `~/.agents/skills/mdx` and checks that `mdxv` is on PATH.

## Output

Write MDX to a path in the current project (e.g. `docs/<slug>.mdx` or a path the user specifies).

- Open locally with `mdxv <path>` from the project root.
- Default HTML goes to the user cache (`$XDG_CACHE_HOME/mdxv/<hash>/`). Use `-o path.html` for an explicit output path.
- Do not add npm deps to the project. Do not copy React components into the repo.

## Component source

To read component implementation (props, behavior), run `mdxv --components`. It prints the path to `src/components/` in the global install. Do not copy those files into user projects.

## Authoring rules

- Multiline strings in props: use JSX expressions, e.g. `code={"line1\nline2"}`.
- Every `<Diff>` needs `summary`, `before`, and `after`.
- New files with no meaningful before state: use `<Code>`, not `<Diff>`.
- **Prefer inline code comments** in `before`, `after`, and `code` strings to explain what changed or why. Put the note on the line it applies to. Reserve `<Diff annotations={...}>` for context that must not appear as code (e.g. "do not commit this yet").
- `<FileTree>` near the top if showing file scope.
- Use `<Callout tone="risk">` (or `warning`, `decision`, `info`, `success`) for assumptions, tradeoffs, and key points.
- Group related blocks with `<Tabs>` and `<Tab label="...">` children.
- **UI mocks:** use ASCII wireframes in `<Code language="text">`. Label each screen with a heading or `caption`. Use `<Tabs>` for multiple screens.

## Blocks

### Diff

Before/after file change. Props: `id?`, `summary`, `filename?`, `language?`, `before`, `after`, `mode?` (`unified`|`split`), `annotations?` (last resort; prefer comments in the snippet).

```mdx
<Diff
  id="diff-handler"
  summary="Add POST /api/tasks handler"
  filename="server/routes/tasks.ts"
  language="ts"
  before={`router.get("/api/tasks", list);`}
  after={`router.get("/api/tasks", list);\nrouter.post("/api/tasks", create); // creates a task`}
/>
```

### FileTree

File scope overview. Props: `title?`, `entries` (`path`, `change?`, `note?`).

`change`: `added` | `modified` | `removed` | `renamed`.

### Code

Plain snippet. Props: `code`, `language?`, `filename?`, `caption?`, `maxLines?`. Use inline comments in `code` for line-level notes; use `caption` for file-level context.

Also use for **UI mocks** (`language="text"`). Draw screens with box characters or `+---+` borders. Keep a fixed width (25–40 chars). Show nav bars, lists, buttons, and multi-pane layouts inside the frame.

```mdx
<Code
  language="text"
  caption="After tapping a category"
  code={`┌─────────────────────────┐
│  ← Back          Legs   │
├─────────────────────────┤
│  Squat            3×8   │
│  Leg Press       3×10   │
│  Romanian DL     3×10   │
│                         │
│  [ + Add exercise ]     │
└─────────────────────────┘`}
/>
```

### Callout

Note or aside. Props: `tone?`, `body` (markdown string).

### Mermaid

Diagram. Props: `source`, `caption?`.

### Tabs

Group blocks by file, section, or step. Wrap `<Tab label="..." id?="...">` children.

```mdx
<Tabs>
  <Tab id="handler" label="tasks.ts">
    <Diff ... />
  </Tab>
</Tabs>
```
