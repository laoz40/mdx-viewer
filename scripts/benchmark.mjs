#!/usr/bin/env node
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

import { build } from "./build.mjs";
import { resolveOutDir } from "./cache.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function topInputs(metafile, limit = 20) {
  const [output] = Object.values(metafile.outputs);
  const inputs = Object.entries(output.inputs)
    .map(([name, info]) => ({
      name,
      bytes: info.bytesInOutput,
      pct: (info.bytesInOutput / output.bytes) * 100,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);

  const lines = inputs.map(
    (entry) =>
      `  ${formatBytes(entry.bytes).padStart(8)}  ${entry.pct.toFixed(1).padStart(5)}%  ${entry.name}`,
  );
  return lines.join("\n");
}

function parseArgs(argv) {
  let mdxPath = path.join(root, "example/example.mdx");
  let runs = 1;
  let json = false;
  let verbose = false;

  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--verbose") {
      verbose = true;
      continue;
    }
    if (arg.startsWith("--runs=")) {
      runs = Number(arg.slice("--runs=".length));
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage: pnpm benchmark [options] [path.mdx]

Measure build time and output size for an MDX document.

Options:
  --runs=N    Build N times and report average time (default: 1)
  --verbose   Print full esbuild metafile tree
  --json      Print machine-readable JSON
  -h, --help  Show this help

Examples:
  pnpm benchmark
  pnpm benchmark example/example.mdx
  pnpm benchmark --runs=3 docs/guide.mdx`);
      process.exit(0);
    }
    if (!arg.startsWith("-")) {
      mdxPath = path.resolve(arg);
    }
  }

  if (!Number.isInteger(runs) || runs < 1) {
    console.error("error: --runs must be a positive integer");
    process.exit(1);
  }

  return { mdxPath, runs, json, verbose };
}

async function runOnce(mdxPath, withMetafile) {
  const outDir = await resolveOutDir(mdxPath);
  const start = performance.now();
  const result = await build({ root, mdxPath, outDir, metafile: withMetafile });
  const buildMs = performance.now() - start;
  return { ...result, buildMs };
}

const { mdxPath, runs, json, verbose } = parseArgs(process.argv.slice(2));

const timings = [];
let lastResult;

for (let i = 0; i < runs; i++) {
  const withMetafile = i === runs - 1;
  lastResult = await runOnce(mdxPath, withMetafile);
  timings.push(lastResult.buildMs);
}

const avgMs = timings.reduce((sum, ms) => sum + ms, 0) / timings.length;
const metafileReport = lastResult.metafile
  ? await esbuild.analyzeMetafile(lastResult.metafile, { color: false })
  : null;

const report = {
  input: mdxPath,
  output: lastResult.htmlFile,
  runs,
  buildMs: {
    last: Math.round(lastResult.buildMs),
    avg: Math.round(avgMs),
    all: timings.map((ms) => Math.round(ms)),
  },
  size: {
    html: lastResult.htmlBytes,
    js: lastResult.jsBytes,
    css: lastResult.cssBytes,
  },
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`input:  ${report.input}`);
console.log(`output: ${report.output}`);
console.log("");
console.log("Build time");
if (runs === 1) {
  console.log(`  ${report.buildMs.last} ms`);
} else {
  console.log(`  avg:  ${report.buildMs.avg} ms (${runs} runs)`);
  console.log(`  last: ${report.buildMs.last} ms`);
  console.log(`  all:  ${report.buildMs.all.join(", ")} ms`);
}
console.log("");
console.log("Output size");
console.log(`  HTML total: ${formatBytes(report.size.html)}`);
console.log(`  JS inlined: ${formatBytes(report.size.js)}`);
console.log(`  CSS inlined: ${formatBytes(report.size.css)}`);

if (lastResult.metafile) {
  console.log("");
  if (verbose && metafileReport) {
    console.log("Bundle breakdown (esbuild metafile)");
    console.log(metafileReport);
  } else {
    console.log("Top bundle inputs (by bytes in output)");
    console.log(topInputs(lastResult.metafile));
  }
}
