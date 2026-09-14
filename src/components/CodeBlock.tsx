import { useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
  caption?: string;
  maxLines?: number;
  html: string;
};

export function CodeBlock({
  code,
  language = "text",
  filename,
  caption,
  maxLines,
  html,
}: CodeBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const lineCount = code.split("\n").length;
  const collapsible = typeof maxLines === "number" && maxLines > 0 && lineCount > maxLines;

  return (
    <figure className="code-block">
      {(filename || language) && (
        <header className="code-block__header">
          {filename && <span className="code-block__filename">{filename}</span>}
          {language && <span className="code-block__lang">{language}</span>}
        </header>
      )}
      <div
        className={[
          "code-block__body shiki-wrap",
          collapsible && !expanded ? "code-block__body--collapsed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={collapsible && !expanded ? { maxHeight: `${maxLines * 1.5}em` } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {collapsible && (
        <button
          type="button"
          className="code-block__toggle"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : `Show all ${lineCount} lines`}
        </button>
      )}
      {caption && <figcaption className="code-block__caption">{caption}</figcaption>}
    </figure>
  );
}
