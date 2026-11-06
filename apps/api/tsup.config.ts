import { defineConfig } from "tsup";

// One file that runs with plain Node: the workspace packages are TypeScript source, so they cannot
// stay as imports, and bundling the libraries too means the image has no node_modules. The libraries
// that are CommonJS ask for require(), which a module has to be given.
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node24",
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: [/.*/],
  external: ["pg-native"],
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
});
