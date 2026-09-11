import type { MDXComponents } from "mdx/types";

import { AnnotatedCode } from "./components/AnnotatedCode";
import { Callout } from "./components/Callout";
import { Checklist } from "./components/Checklist";
import { Code } from "./components/Code";
import { Diff } from "./components/Diff";
import { FileTree } from "./components/FileTree";
import { Mermaid } from "./components/Mermaid";
import { Tab, Tabs } from "./components/Tabs";

export const planMdxComponents: MDXComponents = {
  Diff,
  AnnotatedCode,
  FileTree,
  Code,
  Callout,
  Checklist,
  Mermaid,
  Tabs,
  Tab,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...planMdxComponents,
  };
}
