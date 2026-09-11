---
name: create-mdx-plan
description: Write structured implementation plans as local MDX files with custom components. Use when the user wants a visual coding plan or MDX plan.
---

# Create MDX plan

## Output

Write plans to `plans/<slug>/plan.mdx` in the current project (or `plans/<slug>.mdx`).

- Open locally with `mdxp plans/<slug>` from the project root.
- Do not add npm deps to the project. Do not copy React components into the repo.

## Authoring rules

- Multiline strings in props: use JSX expressions, e.g. `code={"line1\nline2"}`.
- Every `<Diff>` needs `summary`, `before`, and `after`.
- New files with no meaningful before state: use `<AnnotatedCode>`, not `<Diff>`.
- Prefer `<FileTree>` near the top for scope.
- Use `<Callout tone="risk">` (or `warning`, `decision`, `info`, `success`) for assumptions and tradeoffs.
- Group per-file changes with `<Tabs>` and `<Tab label="...">` children.

## Blocks

### Diff

Before/after file change. Props: `id?`, `summary`, `filename?`, `language?`, `before`, `after`, `mode?` (`unified`|`split`), `annotations?`.

```mdx
<Diff
  id="diff-handler"
  summary="Add POST /api/tasks handler"
  filename="server/routes/tasks.ts"
  language="ts"
  before={`router.get("/api/tasks", list);`}
  after={`router.get("/api/tasks", list);\nrouter.post("/api/tasks", create);`}
  annotations={[{ side: "after", lines: "2", label: "New route", note: "Creates a task" }]}
/>
```

### AnnotatedCode

New file or walkthrough. Props: `filename?`, `language?`, `code`, `annotations?` (`lines`, `label?`, `note`).

### FileTree

Scope overview. Props: `title?`, `entries` (`path`, `change?`, `note?`).

`change`: `added` | `modified` | `removed` | `renamed`.

### Code

Plain snippet. Props: `code`, `language?`, `filename?`, `caption?`, `maxLines?`.

### Callout

Note or decision. Props: `tone?`, `body` (markdown string).

### Checklist

Implementation steps. Props: `items` (`id`, `label`, `checked?`, `note?`).

### Mermaid

Diagram. Props: `source`, `caption?`.

### Tabs

Group blocks by file or step. Wrap `<Tab label="..." id?="...">` children.

```mdx
<Tabs>
  <Tab id="handler" label="tasks.ts">
    <Diff ... />
  </Tab>
</Tabs>
```

## Plan skeleton

```mdx
# [Plan title]

<Callout tone="decision" body="[Key decision in one or two sentences]" />

<FileTree title="Scope" entries={[...]} />

<Tabs>
  <Tab label="file-a.ts">
    <Diff summary="..." before={``} after={``} />
  </Tab>
</Tabs>

<Checklist items={[...]} />
```
