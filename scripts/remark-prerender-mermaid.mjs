import { renderMermaid } from "./mermaid.mjs";

function literal(value) {
  return { type: "Literal", value, raw: JSON.stringify(value) };
}

function exprAttr(name, value) {
  const source = JSON.stringify(value);

  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: source,
      data: {
        estree: {
          type: "Program",
          body: [{ type: "ExpressionStatement", expression: literal(value) }],
          sourceType: "module",
        },
      },
    },
  };
}

function evalJsxExpression(source) {
  try {
    return Function(`"use strict"; return (${source});`)();
  } catch {
    return undefined;
  }
}

function getStringAttr(attributes, name) {
  const attr = attributes.find((item) => item.type === "mdxJsxAttribute" && item.name === name);
  if (!attr) return undefined;
  if (typeof attr.value === "string") return attr.value;
  if (attr.value?.type === "mdxJsxAttributeValueExpression") {
    return evalJsxExpression(attr.value.value);
  }
  return undefined;
}

async function visitNode(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    if (node.name === "Mermaid") {
      const source = getStringAttr(node.attributes, "source");
      if (source !== undefined) {
        const svg = await renderMermaid(source);
        node.attributes.push(exprAttr("svg", svg));
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await visitNode(child);
    }
  }
}

export function remarkPrerenderMermaid() {
  return async (tree) => {
    await visitNode(tree);
  };
}
