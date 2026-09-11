import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";

type MermaidProps = {
  source: string;
  caption?: string;
};

let initialized = false;

export function Mermaid({ source, caption }: MermaidProps) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
      });
      initialized = true;
    }

    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    void mermaid.render(`mermaid-${id}`, source).then(({ svg }) => {
      if (!cancelled) node.innerHTML = svg;
    });

    return () => {
      cancelled = true;
    };
  }, [id, source]);

  return (
    <figure className="mermaid-block">
      <div ref={containerRef} className="mermaid-block__diagram" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
