import type { MDXComponents } from "mdx/types";

import { Callout } from "./components/Callout";
import { Code } from "./components/Code";
import { Diff } from "./components/Diff";
import { FileTree } from "./components/FileTree";
import { Mermaid } from "./components/Mermaid";
import { Tab, Tabs } from "./components/Tabs";

export const planMdxComponents: MDXComponents = {
  Diff,
  FileTree,
  Code,
  Callout,
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
