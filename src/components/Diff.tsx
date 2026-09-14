import { diffLines } from "diff";
import { useMemo } from "react";

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
  beforeHighlights: string[];
  afterHighlights: string[];
};

type DiffRow = {
  kind: "same" | "add" | "remove";
  beforeLine?: string;
  afterLine?: string;
  beforeNo?: number;
  afterNo?: number;
};

function normalizeDiffText(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

function buildRows(before: string, after: string): DiffRow[] {
  const changes = diffLines(normalizeDiffText(before), normalizeDiffText(after));
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

function diffRowClass(kind: DiffRow["kind"]) {
  return kind === "same" ? "diff-row" : `diff-row diff-row--${kind}`;
}

function splitRowClass(side: "before" | "after", kind: DiffRow["kind"]) {
  if (side === "before" && kind === "remove") return diffRowClass("remove");
  if (side === "after" && kind === "add") return diffRowClass("add");
  return diffRowClass("same");
}

function DiffAnnotationNote({ note }: { note: DiffAnnotation }) {
  return (
    <aside className="diff-annotation">
      {note.label && <strong className="diff-annotation__label">{note.label}</strong>}
      <span>{note.note}</span>
    </aside>
  );
}

type HighlightedLines = {
  before: string[];
  after: string[];
};

function DiffLine({ html, fallback }: { html?: string; fallback: string }) {
  return (
    <span className="diff-line-wrap">
      <div className="diff-line-pre">
        {html ? (
          <code className="diff-table__code" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="diff-table__code">{fallback || "\u00a0"}</code>
        )}
      </div>
    </span>
  );
}

function SplitPane({
  side,
  label,
  rows,
  annotations,
  highlights,
}: {
  side: "before" | "after";
  label: string;
  rows: DiffRow[];
  annotations?: DiffAnnotation[];
  highlights: HighlightedLines;
}) {
  return (
    <div className="diff-pane">
      <div className="diff-pane__label">{label}</div>
      <div className="diff-block__body">
        <table className="diff-table">
          <tbody>
            {rows.map((row, index) => {
              const lineNo = side === "before" ? row.beforeNo : row.afterNo;
              const line = side === "before" ? row.beforeLine : row.afterLine;
              const note = annotationForLine(annotations, side, lineNo);
              const html = lineNo !== undefined ? highlights[side][lineNo - 1] : undefined;

              return (
                <tr key={`${side}-${row.kind}-${index}`} className={splitRowClass(side, row.kind)}>
                  <td className="diff-table__gutter">{lineNo ?? ""}</td>
                  <td className="diff-table__line">
                    <DiffLine html={html} fallback={line ?? ""} />
                    {note && <DiffAnnotationNote note={note} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Diff({
  summary,
  filename,
  before,
  after,
  mode = "unified",
  annotations,
  beforeHighlights,
  afterHighlights,
}: DiffProps) {
  const rows = useMemo(() => buildRows(before, after), [before, after]);
  const highlights: HighlightedLines = { before: beforeHighlights, after: afterHighlights };

  return (
    <section className="diff-block">
      <header className="diff-block__header">
        {summary && <h3 className="diff-block__summary">{summary}</h3>}
        {filename && <code className="diff-block__filename">{filename}</code>}
      </header>

      {mode === "split" ? (
        <div className="diff-block__split">
          <SplitPane
            side="before"
            label="before"
            rows={rows}
            annotations={annotations}
            highlights={highlights}
          />
          <SplitPane
            side="after"
            label="after"
            rows={rows}
            annotations={annotations}
            highlights={highlights}
          />
        </div>
      ) : (
        <div className="diff-block__body">
          <table className="diff-table">
            <tbody>
              {rows.map((row, index) => {
                const beforeNote = annotationForLine(annotations, "before", row.beforeNo);
                const afterNote = annotationForLine(annotations, "after", row.afterNo);
                const note = afterNote ?? beforeNote;
                const line = row.afterLine ?? row.beforeLine ?? "";
                const html =
                  row.kind === "remove" && row.beforeNo !== undefined
                    ? highlights.before[row.beforeNo - 1]
                    : row.afterNo !== undefined
                      ? highlights.after[row.afterNo - 1]
                      : undefined;

                return (
                  <tr key={`${row.kind}-${index}`} className={diffRowClass(row.kind)}>
                    <td className="diff-table__gutter">{row.beforeNo ?? ""}</td>
                    <td className="diff-table__gutter">{row.afterNo ?? ""}</td>
                    <td className="diff-table__sign">
                      {row.kind === "add" ? "+" : row.kind === "remove" ? "-" : " "}
                    </td>
                    <td className="diff-table__line">
                      <DiffLine html={html} fallback={line} />
                      {note && <DiffAnnotationNote note={note} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
