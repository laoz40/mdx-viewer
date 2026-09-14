import { createHighlighter } from "shiki";

const THEME = "tokyo-night";

const LANG_ALIASES = {
  ts: "typescript",
  js: "javascript",
  py: "python",
  sh: "bash",
};

/** @type {import("shiki").Highlighter | null} */
let highlighter = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: [THEME],
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

function normalizeLanguage(language) {
  const lowered = language.toLowerCase();
  return LANG_ALIASES[lowered] ?? lowered;
}

function resolveLanguage(hl, language) {
  const lang = normalizeLanguage(language);
  return hl.getLoadedLanguages().includes(lang) ? lang : "text";
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function themedTokensToHtml(tokens) {
  return tokens
    .map((token) => {
      const styles = [];
      if (token.color) styles.push(`color:${token.color}`);
      if (token.bgColor) styles.push(`background-color:${token.bgColor}`);
      if (token.fontStyle) {
        if (token.fontStyle & 1) styles.push("font-weight:bold");
        if (token.fontStyle & 2) styles.push("font-style:italic");
        if (token.fontStyle & 4) styles.push("text-decoration:underline");
      }
      const style = styles.length ? ` style="${styles.join(";")}"` : "";
      return `<span${style}>${escapeHtml(token.content)}</span>`;
    })
    .join("");
}

export async function highlightCode(code, language = "text") {
  const hl = await getHighlighter();
  const lang = resolveLanguage(hl, language);
  return hl.codeToHtml(code, { lang, theme: THEME });
}

export async function highlightCodeLines(code, language = "text") {
  const hl = await getHighlighter();
  const lang = resolveLanguage(hl, language);
  const normalized = code.endsWith("\n") ? code : `${code}\n`;
  const { tokens } = await hl.codeToTokens(normalized, { lang, theme: THEME });
  return tokens.map((line) => themedTokensToHtml(line) || "\u00a0");
}
