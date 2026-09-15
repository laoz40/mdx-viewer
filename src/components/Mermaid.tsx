type MermaidProps = {
  source: string;
  caption?: string;
  svg: string;
};

export function Mermaid({ caption, svg }: MermaidProps) {
  return (
    <figure className="mermaid-block">
      <div className="mermaid-block__diagram" dangerouslySetInnerHTML={{ __html: svg }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
