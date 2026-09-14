import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import * as esbuild from "esbuild";
import mdx from "@mdx-js/esbuild";
import remarkGfm from "remark-gfm";

import { remarkPrehighlight } from "./remark-prehighlight.mjs";

export function pageTitle(mdxPath) {
  const baseName = path.basename(mdxPath);
  if (baseName === "plan.mdx" || baseName === "plan.md") {
    return path.basename(path.dirname(mdxPath));
  }
  return baseName;
}

export function outputFileName(mdxPath) {
  const baseName = path.basename(mdxPath);
  if (baseName === "plan.mdx" || baseName === "plan.md") {
    return `${path.basename(path.dirname(mdxPath))}.html`;
  }
  return `${path.basename(mdxPath, path.extname(mdxPath))}.html`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function stageMdx(mdxPath, outDir) {
  await mkdir(outDir, { recursive: true });
  const stagedMdx = path.join(outDir, "source.mdx");
  await cp(mdxPath, stagedMdx);
  return stagedMdx;
}

export async function build({ root, mdxPath, outDir, metafile = false }) {
  const stagedMdx = await stageMdx(mdxPath, outDir);

  const result = await esbuild.build({
    absWorkingDir: root,
    entryPoints: [path.join(root, "src/main.tsx")],
    bundle: true,
    write: false,
    format: "iife",
    outfile: path.join(outDir, "bundle.js"),
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    jsxImportSource: "react",
    metafile,
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm, remarkPrehighlight],
      }),
    ],
    alias: {
      "@plan": stagedMdx,
    },
    loader: {
      ".css": "css",
    },
  });

  const js = result.outputFiles.find((file) => file.path.endsWith(".js"))?.text;
  if (!js) {
    throw new Error("esbuild did not emit JavaScript output");
  }

  const css = result.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
  const faviconSvg = await readFile(path.join(root, "public/favicon.svg"), "utf8");
  const faviconHref = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
  const title = escapeHtml(pageTitle(mdxPath));
  const safeJs = js.replace(/<\/script/gi, "<\\/script");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${faviconHref}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>${safeJs}</script>
  </body>
</html>
`;

  const htmlFile = path.join(outDir, outputFileName(mdxPath));
  await writeFile(htmlFile, html);

  return {
    htmlFile,
    jsBytes: Buffer.byteLength(js, "utf8"),
    cssBytes: Buffer.byteLength(css, "utf8"),
    htmlBytes: Buffer.byteLength(html, "utf8"),
    metafile: result.metafile,
  };
}
