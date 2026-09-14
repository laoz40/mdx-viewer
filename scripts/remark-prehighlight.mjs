import { highlightCode, highlightCodeLines } from "./shiki.mjs";

function literal(value) {
  return { type: "Literal", value, raw: JSON.stringify(value) };
}

function exprAttr(name, value) {
  const source = JSON.stringify(value);
  const expression = Array.isArray(value)
    ? { type: "ArrayExpression", elements: value.map(literal) }
    : literal(value);

  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: source,
      data: {
        estree: {
          type: "Program",
          body: [{ type: "ExpressionStatement", expression }],
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
    if (node.name === "Code") {
      const code = getStringAttr(node.attributes, "code");
      if (code !== undefined) {
        const language = getStringAttr(node.attributes, "language") ?? "text";
        const html = await highlightCode(code, language);
        node.attributes.push(exprAttr("html", html));
      }
    }

    if (node.name === "Diff") {
      const before = getStringAttr(node.attributes, "before");
      const after = getStringAttr(node.attributes, "after");
      if (before !== undefined && after !== undefined) {
        const language = getStringAttr(node.attributes, "language") ?? "text";
        const [beforeHighlights, afterHighlights] = await Promise.all([
          highlightCodeLines(before, language),
          highlightCodeLines(after, language),
        ]);
        node.attributes.push(exprAttr("beforeHighlights", beforeHighlights));
        node.attributes.push(exprAttr("afterHighlights", afterHighlights));
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await visitNode(child);
    }
  }
}

export function remarkPrehighlight() {
  return async (tree) => {
    await visitNode(tree);
  };
}
