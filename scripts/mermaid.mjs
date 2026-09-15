import { createHTMLWindow } from "svgdom";
import mermaid from "mermaid";

let initialized = false;
let counter = 0;

function ensureDom() {
  if (!globalThis.window?.document?.createElementNS) {
    const svgWindow = createHTMLWindow();
    Object.assign(globalThis, { window: svgWindow, document: svgWindow.document });
  }

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

function ensureMermaid() {
  ensureDom();
  if (initialized) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    htmlLabels: false,
  });
  initialized = true;
}

export async function renderMermaid(source) {
  ensureMermaid();
  const id = `mdxv-mermaid-${++counter}`;
  const { svg } = await mermaid.render(id, source);
  return svg;
}
