import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript",
        "tsx",
        "javascript",
        "jsx",
        "json",
        "bash",
        "shell",
        "python",
        "rust",
        "go",
        "sql",
        "yaml",
        "markdown",
        "html",
        "css",
        "text",
      ],
    });
  }
  return highlighter;
}

export async function highlightCode(code: string, language = "text"): Promise<string> {
  const hl = await getHighlighter();
  const lang = hl.getLoadedLanguages().includes(language as never) ? language : "text";
  return hl.codeToHtml(code, { lang, theme: "github-dark" });
}
