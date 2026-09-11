import { CodeBlock } from "./CodeBlock";

type CodeProps = {
  code: string;
  language?: string;
  filename?: string;
  caption?: string;
  maxLines?: number;
};

export function Code(props: CodeProps) {
  return <CodeBlock {...props} />;
}
