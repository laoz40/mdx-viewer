import type { CalloutTone } from "../types";

type CalloutProps = {
  tone?: CalloutTone;
  html: string;
};

export function Callout({ tone = "info", html }: CalloutProps) {
  return (
    <aside className={`callout callout--${tone}`}>
      <div className="callout__label">{tone}</div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </aside>
  );
}
