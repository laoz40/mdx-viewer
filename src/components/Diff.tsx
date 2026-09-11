import { diffLines } from "diff";
import { useEffect, useMemo, useState } from "react";

import { highlightCode } from "../lib/shiki";
import { parseLineRange } from "../lib/lines";
import type { DiffAnnotation } from "../types";

type DiffProps = {
  id?: string;
  summary?: string;
  filename?: string;
  language?: string;
  before: string;
  after: string;
  mode?: "unified" | "split";
  annotations?: DiffAnnotation[];
};

type DiffRow = {
  kind: "same" | "add" | "remove";
  beforeLine?: string;
  afterLine?: string;
  beforeNo?: number;
  afterNo?: number;
};

function buildRows(before: string, after: string): DiffRow[] {
  const changes = diffLines(before, after);
  const rows: DiffRow[] = [];
  let beforeNo = 1;
  let afterNo = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    if (change.added) {
      for (const line of lines) {
        rows.push({ kind: "add", afterLine: line, afterNo });
        afterNo += 1;
      }
      continue;
    }
    if (change.removed) {
      for (const line of lines) {
        rows.push({ kind: "remove", beforeLine: line, beforeNo });
        beforeNo += 1;
      }
      continue;
    }
    for (const line of lines) {
      rows.push({
        kind: "same",
        beforeLine: line,
        afterLine: line,
        beforeNo,
        afterNo,
      });
      beforeNo += 1;
      afterNo += 1;
    }
  }

  return rows;
}

function annotationForLine(
  annotations: DiffAnnotation[] | undefined,
  side: "before" | "after",
  lineNo: number | undefined,
): DiffAnnotation | undefined {
  if (!annotations || lineNo === undefined) return undefined;
  return annotations.find((item) => {
    if (item.side && item.side !== side) return false;
    return parseLineRange(item.lines).includes(lineNo);
  });
}

export function Diff({
  summary,
  filename,
  language = "text",
  before,
  after,
  mode = "unified",
  annotations,
}: DiffProps) {
  const rows = useMemo(() => buildRows(before, after), [before, after]);
  const [beforeHtml, setBeforeHtml] = useState("");
  const [afterHtml, setAfterHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    void Promise.all([highlightCode(before, language), highlightCode(after, language)]).then(
      ([beforeResult, afterResult]) => {
        if (!cancelled) {
          setBeforeHtml(beforeResult);
          setAfterHtml(afterResult);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [before, after, language]);

  return (
    <section className="diff-block">
      <header className="diff-block__header">
        {summary && <h3 className="diff-block__summary">{summary}</h3>}
        {filename && <code className="diff-block__filename">{filename}</code>}
      </header>

      {mode === "split" ? (
        <div className="diff-block__split">
          <div className="diff-pane">
            <div className="diff-pane__label">before</div>
            <div className="shiki-wrap" dangerouslySetInnerHTML={{ __html: beforeHtml }} />
          </div>
          <div className="diff-pane">
            <div className="diff-pane__label">after</div>
            <div className="shiki-wrap" dangerouslySetInnerHTML={{ __html: afterHtml }} />
          </div>
        </div>
      ) : (
        <table className="diff-table">
          <tbody>
            {rows.map((row, index) => {
              const beforeNote = annotationForLine(annotations, "before", row.beforeNo);
              const afterNote = annotationForLine(annotations, "after", row.afterNo);
              const note = afterNote ?? beforeNote;

              return (
                <tr key={`${row.kind}-${index}`} className={`diff-row diff-row--${row.kind}`}>
                  <td className="diff-table__gutter">{row.beforeNo ?? ""}</td>
                  <td className="diff-table__gutter">{row.afterNo ?? ""}</td>
                  <td className="diff-table__sign">
                    {row.kind === "add" ? "+" : row.kind === "remove" ? "-" : " "}
                  </td>
                  <td className="diff-table__line">
                    <code>{row.afterLine ?? row.beforeLine ?? ""}</code>
                    {note && (
                      <aside className="diff-annotation">
                        {note.label && (
                          <strong className="diff-annotation__label">{note.label}</strong>
                        )}
                        <span>{note.note}</span>
                      </aside>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
