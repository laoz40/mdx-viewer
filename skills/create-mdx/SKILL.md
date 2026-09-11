---
name: create-mdx
description: Write structured MDX documents with custom components for visual explanations, walkthroughs, diagrams, and other rich docs. Use when the user wants MDX with Diff, FileTree, Mermaid, Callouts, etc.
---

# Create MDX

## Output

Write MDX to a path in the current project (e.g. `docs/<slug>.mdx` or a path the user specifies).

- Open locally with `mdxp <path>` from the project root.
- Do not add npm deps to the project. Do not copy React components into the repo.

## Authoring rules

- Multiline strings in props: use JSX expressions, e.g. `code={"line1\nline2"}`.
- Every `<Diff>` needs `summary`, `before`, and `after`.
- New files with no meaningful before state: use `<Code>`, not `<Diff>`.
- **Prefer inline code comments** in `before`, `after`, and `code` strings to explain what changed or why. Put the note on the line it applies to. Reserve `<Diff annotations={...}>` for context that must not appear as code (e.g. "do not commit this yet").
- Prefer `<FileTree>` near the top when showing file scope.
- Use `<Callout tone="risk">` (or `warning`, `decision`, `info`, `success`) for assumptions, tradeoffs, and key points.
- Group related blocks with `<Tabs>` and `<Tab label="...">` children.
- Use markdown task lists (`- [ ]` / `- [x]`) for steps or checklists when useful.

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
