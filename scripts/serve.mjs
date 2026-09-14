#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";
import mdx from "@mdx-js/esbuild";
import remarkGfm from "remark-gfm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const planFile = process.env.PLAN_FILE
  ? path.resolve(process.env.PLAN_FILE)
  : path.resolve(root, "example/plan.mdx");
const port = Number(process.env.PLAN_PORT ?? 5199);
const host = process.env.PLAN_HOST ?? "127.0.0.1";
const openBrowser = process.env.PLAN_OPEN !== "0";
const outDir = path.join(root, ".mdxp-out");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function stagePlan() {
  const stagedPlan = path.join(outDir, "plan.mdx");
  await cp(planFile, stagedPlan);
  return stagedPlan;
}

async function build() {
  await mkdir(outDir, { recursive: true });
  const stagedPlan = await stagePlan();

  await esbuild.build({
    absWorkingDir: root,
    entryPoints: [path.join(root, "src/main.tsx")],
    bundle: true,
    outfile: path.join(outDir, "main.js"),
    format: "esm",
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    jsxImportSource: "react",
    sourcemap: true,
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm],
      }),
    ],
    alias: {
      "@plan": stagedPlan,
    },
    loader: {
      ".css": "css",
    },
  });

  const planBaseName = path.basename(planFile);
  const pageTitle =
    planBaseName === "plan.mdx" || planBaseName === "plan.md"
      ? path.basename(path.dirname(planFile))
      : planBaseName;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageTitle}</title>
    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
`;

  await writeFile(path.join(outDir, "index.html"), html);
  await cp(path.join(root, "public/favicon.svg"), path.join(outDir, "favicon.svg"));
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
    console.warn(`could not open browser automatically; visit ${url}`);
  }
}

function safePath(urlPath) {
  const normalized = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(outDir, normalized);
  if (!filePath.startsWith(outDir)) {
    return null;
  }
  return filePath;
}

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = req.url?.split("?")[0] ?? "/";
      const relativePath = urlPath === "/" ? "index.html" : urlPath.slice(1);
      const filePath = safePath(relativePath);
      if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      const body = await readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const url = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
  console.log(`plan: ${planFile}`);
  console.log(`url: ${url}`);
  console.log("press Ctrl+C to stop");

  if (openBrowser) {
    openUrl(url);
  }

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

console.log("building...");
await build();
await serve();
