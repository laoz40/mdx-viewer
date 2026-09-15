import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export function cacheBaseDir() {
  const xdg = process.env.XDG_CACHE_HOME;
  if (xdg) {
    return path.join(xdg, "mdxv");
  }

  const home = os.homedir();
  if (home) {
    return path.join(home, ".cache", "mdxv");
  }

  return path.join(os.tmpdir(), `mdxv-${process.pid}`);
}

export function cacheDirForMdx(mdxPath) {
  const absolute = path.resolve(mdxPath);
  const hash = createHash("sha256").update(absolute).digest("hex");
  return path.join(cacheBaseDir(), hash);
}

export async function resolveOutDir(mdxPath) {
  const outDir = cacheDirForMdx(mdxPath);
  await mkdir(outDir, { recursive: true });
  return outDir;
}
