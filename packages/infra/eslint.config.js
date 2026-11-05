import config from "@vetra/eslint-config/base";

export default [
  ...config,
  {
    ignores: ["dist", "node_modules"],
  },
];
