import { defineConfig, globalIgnores } from "eslint/config";
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescriptRules from "eslint-config-next/typescript";

const generatedFiles = globalIgnores([
  ".next/**",
  ".vinext/**",
  "dist/**",
  "out/**",
  "next-env.d.ts",
]);

export default defineConfig([
  ...coreWebVitals,
  ...typescriptRules,
  generatedFiles,
]);
