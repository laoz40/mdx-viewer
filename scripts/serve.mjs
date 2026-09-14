#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as esbuild from "esbuild";
import mdx from "@mdx-js/esbuild";
import remarkGfm from "remark-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdxFile = process.env.MDXV_FILE;
const mdxPath = mdxFile
  ? path.resolve(mdxFile)
  : path.resolve(root, "example/example.mdx");
const mode = process.env.MDXV_MODE ?? "default";
const port = Number(process.env.MDXV_PORT ?? 5199);
const host =
  process.env.MDXV_HOST ?? (mode === "serve" ? "0.0.0.0" : "127.0.0.1");
const openBrowser = process.env.MDXV_OPEN !== "0";
const outDir = path.join(root, ".mdxv-out");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageTitle() {
  const baseName = path.basename(mdxPath);
  if (baseName === "plan.mdx" || baseName === "plan.md") {
    return path.basename(path.dirname(mdxPath));
  }
  return baseName;
}

function outputFileName() {
  const baseName = path.basename(mdxPath);
  if (baseName === "plan.mdx" || baseName === "plan.md") {
    return `${path.basename(path.dirname(mdxPath))}.html`;
  }
  return `${path.basename(mdxPath, path.extname(mdxPath))}.html`;
}

async function stageMdx() {
  await mkdir(outDir, { recursive: true });
  const stagedMdx = path.join(outDir, "source.mdx");
  await cp(mdxPath, stagedMdx);
  return stagedMdx;
}

async function build(stagedMdx) {
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
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm],
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

  const css =
    result.outputFiles.find((file) => file.path.endsWith(".css"))?.text ?? "";
  const faviconSvg = await readFile(path.join(root, "public/favicon.svg"), "utf8");
  const faviconHref = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
  const title = escapeHtml(pageTitle());
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

  const htmlFile = path.join(outDir, outputFileName());
  await writeFile(htmlFile, html);
  return htmlFile;
}

function browserEnv() {
  if (process.env.WAYLAND_DISPLAY || process.env.DISPLAY) {
    return process.env;
  }

  const runtimeDir = process.env.XDG_RUNTIME_DIR;
  if (runtimeDir) {
    try {
      const wayland = readdirSync(runtimeDir)
        .filter((name) => /^wayland-\d+$/.test(name))
        .sort((a, b) => Number(a.slice(8)) - Number(b.slice(8)))
        .at(-1);

      if (wayland) {
        return { ...process.env, WAYLAND_DISPLAY: wayland };
      }
    } catch {
      // no runtime dir access
    }
  }

  try {
    const x11 = readdirSync("/tmp/.X11-unix")
      .filter((name) => /^X\d+$/.test(name))
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
      .at(-1);

    if (x11) {
      return { ...process.env, DISPLAY: `:${x11.slice(1)}` };
    }
  } catch {
    // no x11 socket dir
  }

  return process.env;
}

function openUrl(url) {
  try {
    const platform = process.platform;
    if (platform === "darwin") {
      execFileSync("open", [url], { stdio: "ignore" });
      return;
    }
    if (platform === "win32") {
      execFileSync("cmd", ["/c", "start", "", url], { stdio: "ignore" });
      return;
    }
    execFileSync("xdg-open", [url], { stdio: "ignore", env: browserEnv() });
  } catch {
    console.warn(`could not open browser automatically; open ${url}`);
  }
}

function openFile(filePath) {
  openUrl(pathToFileURL(filePath).href);
}

async function serve(htmlFile) {
  const body = await readFile(htmlFile);

  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(body);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  if (host === "0.0.0.0") {
    console.log(`listening: http://0.0.0.0:${port}`);
    console.log(`local: http://localhost:${port}`);
  } else {
    console.log(`url: http://${host}:${port}`);
  }
  console.log("press Ctrl+C to stop");

  const openUrlTarget =
    host === "0.0.0.0" ? `http://localhost:${port}` : `http://${host}:${port}`;
  if (openBrowser) {
    openUrl(openUrlTarget);
  }

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

console.log("building...");
const stagedMdx = await stageMdx();
const htmlFile = await build(stagedMdx);

console.log(`input: ${mdxPath}`);
console.log(`output: ${htmlFile}`);

if (mode === "default") {
  if (openBrowser) {
    openFile(htmlFile);
  }
  process.exit(0);
}

await serve(htmlFile);
