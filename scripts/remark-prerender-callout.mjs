import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

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

function removeAttr(attributes, name) {
  const index = attributes.findIndex(
    (item) => item.type === "mdxJsxAttribute" && item.name === name,
  );
  if (index !== -1) attributes.splice(index, 1);
}

const renderMarkdown = remark().use(remarkGfm).use(remarkRehype).use(rehypeStringify);

async function visitNode(node) {
  if (!node || typeof node !== "object") return;

  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    if (node.name === "Callout") {
      const body = getStringAttr(node.attributes, "body");
      if (body !== undefined) {
        const file = await renderMarkdown.process(body);
        node.attributes.push(exprAttr("html", String(file)));
        removeAttr(node.attributes, "body");
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await visitNode(child);
    }
  }
}

export function remarkPrerenderCallout() {
  return async (tree) => {
    await visitNode(tree);
  };
}
