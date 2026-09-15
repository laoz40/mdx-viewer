#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { build } from "./build.mjs";
import { resolveOutDir } from "./cache.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mdxFile = process.env.MDXP_FILE;
const mdxPath = mdxFile ? path.resolve(mdxFile) : path.resolve(root, "example/example.mdx");
const mode = process.env.MDXP_MODE ?? "default";
const port = Number(process.env.MDXP_PORT ?? 5199);
const host = process.env.MDXP_HOST ?? (mode === "serve" ? "0.0.0.0" : "127.0.0.1");
const openBrowser = process.env.MDXP_OPEN !== "0";
const outDir = await resolveOutDir(mdxPath);
const htmlFileOverride = process.env.MDXP_OUTPUT
  ? path.resolve(process.env.MDXP_OUTPUT)
  : undefined;

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

  const openUrlTarget = host === "0.0.0.0" ? `http://localhost:${port}` : `http://${host}:${port}`;
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
const { htmlFile } = await build({ root, mdxPath, outDir, htmlFile: htmlFileOverride });

console.log(`input: ${mdxPath}`);
console.log(`output: ${htmlFile}`);

if (mode === "default") {
  if (openBrowser) {
    openFile(htmlFile);
  }
  process.exit(0);
}

await serve(htmlFile);
