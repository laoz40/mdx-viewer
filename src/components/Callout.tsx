import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { CalloutTone } from "../types";

type CalloutProps = {
  tone?: CalloutTone;
  body: string;
};

export function Callout({ tone = "info", body }: CalloutProps) {
  return (
    <aside className={`callout callout--${tone}`}>
      <div className="callout__label">{tone}</div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </aside>
  );
}
