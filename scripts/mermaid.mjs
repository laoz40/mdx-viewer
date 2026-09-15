import { createHTMLWindow } from "svgdom";
import createDOMPurify from "dompurify";

let initialized = false;
let counter = 0;
/** @type {typeof import("mermaid").default | null} */
let mermaid = null;

function setupDom() {
  if (globalThis.window?.document?.createElementNS) return;

  const svgWindow = createHTMLWindow();
  Object.assign(globalThis, { window: svgWindow, document: svgWindow.document });
  Object.assign(createDOMPurify, createDOMPurify(svgWindow));

  if (!globalThis.CSSStyleSheet) {
    globalThis.CSSStyleSheet = class CSSStyleSheet {
      constructor() {
        this.cssRules = [];
      }

      insertRule(rule, index) {
        const i = index ?? this.cssRules.length;
        this.cssRules.splice(i, 0, rule);
        return i;
      }

      replaceSync(text) {
        for (const part of text.split("}").filter(Boolean)) {
          this.insertRule(`${part.trim()}}`);
        }
      }
    };
  }
}

setupDom();

async function ensureMermaid() {
  if (!mermaid) {
    mermaid = (await import("mermaid")).default;
  }

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      htmlLabels: false,
    });
    initialized = true;
  }

  return mermaid;
}

export async function renderMermaid(source) {
  const api = await ensureMermaid();
  const id = `mdxv-mermaid-${++counter}`;
  const { svg } = await api.render(id, source);
  return svg;
}
