import { CodeBlock } from "./CodeBlock";

type CodeProps = {
  code: string;
  language?: string;
  filename?: string;
  caption?: string;
  maxLines?: number;
  html: string;
};

export function Code(props: CodeProps) {
  return <CodeBlock {...props} />;
}
