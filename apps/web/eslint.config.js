import config from "@vetra/eslint-config/web";

export default [
  ...config,
  {
    ignores: [
      "node_modules",
      ".next",
      ".turbo",
      "dist",
      "*.config.js",
      "*.config.ts",
      "next-env.d.ts",
      "routeTree.gen.ts",
    ],
  },
];
