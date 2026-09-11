import { useEffect, useMemo, useState } from "react";

import { highlightCode } from "../lib/shiki";
import { parseLineRange } from "../lib/lines";
import type { AnnotatedCodeAnnotation } from "../types";

type AnnotatedCodeProps = {
  filename?: string;
  language?: string;
  code: string;
  annotations?: AnnotatedCodeAnnotation[];
};

export function AnnotatedCode({
  filename,
  language = "text",
  code,
  annotations = [],
}: AnnotatedCodeProps) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    void highlightCode(code, language).then((result) => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const notesByLine = useMemo(() => {
    const map = new Map<number, AnnotatedCodeAnnotation[]>();
    for (const annotation of annotations) {
      for (const lineNo of parseLineRange(annotation.lines)) {
        const existing = map.get(lineNo) ?? [];
        existing.push(annotation);
        map.set(lineNo, existing);
      }
    }
    return map;
  }, [annotations]);

  return (
    <section className="annotated-code">
      {filename && <header className="annotated-code__header">{filename}</header>}
      <div className="annotated-code__body">
        <div
          className="annotated-code__highlight shiki-wrap"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="annotated-code__notes">
          {lines.map((_, index) => {
            const lineNo = index + 1;
            const notes = notesByLine.get(lineNo) ?? [];
            if (notes.length === 0) return null;
            return (
              <div key={lineNo} className="annotated-code__note-row">
                <span className="annotated-code__gutter">L{lineNo}</span>
                {notes.map((note) => (
                  <aside
                    key={`${lineNo}-${note.label ?? note.note}`}
                    className="annotated-code__note"
                  >
                    {note.label && <strong>{note.label}</strong>}
                    <span>{note.note}</span>
                  </aside>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
