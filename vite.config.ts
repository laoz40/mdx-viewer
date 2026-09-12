import path from "node:path";
import { fileURLToPath } from "node:url";

import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const defaultPlan = path.resolve(root, "examples/sample/plan.mdx");
const planFile = process.env.PLAN_FILE ? path.resolve(process.env.PLAN_FILE) : defaultPlan;

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        mdxExtensions: [".mdx"],
        remarkPlugins: [remarkGfm],
      }),
    },
    react(),
  ],
  resolve: {
    alias: {
      "@plan": planFile,
    },
  },
  server: {
    host: "127.0.0.1",
    port: Number(process.env.PLAN_PORT ?? 5199),
    strictPort: true,
    allowedHosts: [".ts.net"],
    open: process.env.PLAN_OPEN !== "0",
  },
});
