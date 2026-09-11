import { useMemo } from "react";

import type { FileTreeEntry } from "../types";

type FileTreeProps = {
  title?: string;
  entries: FileTreeEntry[];
};

type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
  entry?: FileTreeEntry;
};

function insertPath(root: TreeNode, entry: FileTreeEntry) {
  const parts = entry.path.split("/").filter(Boolean);
  let current = root;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const path = parts.slice(0, index + 1).join("/");
    let child = current.children.find((node) => node.name === part);
    if (!child) {
      child = { name: part, path, children: [] };
      current.children.push(child);
    }
    current = child;
  }

  current.entry = entry;
}

function sortTree(node: TreeNode) {
  node.children.sort((a, b) => a.name.localeCompare(b.name));
  for (const child of node.children) sortTree(child);
}

function TreeBranch({ node }: { node: TreeNode }) {
  const isFile = node.children.length === 0;

  return (
    <li className="file-tree__node">
      <div className="file-tree__row">
        <span className="file-tree__name">{node.name}</span>
        {node.entry?.change && (
          <span className={`file-tree__badge file-tree__badge--${node.entry.change}`}>
            {node.entry.change}
          </span>
        )}
      </div>
      {node.entry?.note && <p className="file-tree__note">{node.entry.note}</p>}
      {!isFile && (
        <ul className="file-tree__children">
          {node.children.map((child) => (
            <TreeBranch key={child.path} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileTree({ title, entries }: FileTreeProps) {
  const root = useMemo(() => {
    const tree: TreeNode = { name: "", path: "", children: [] };
    for (const entry of entries) insertPath(tree, entry);
    sortTree(tree);
    return tree;
  }, [entries]);

  return (
    <section className="file-tree">
      {title && <h3 className="file-tree__title">{title}</h3>}
      <ul className="file-tree__root">
        {root.children.map((child) => (
          <TreeBranch key={child.path} node={child} />
        ))}
      </ul>
    </section>
  );
}
