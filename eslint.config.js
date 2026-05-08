import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/build/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/gen/**",
      "**/__snapshots__/**",
      "**/.next/**",
      "packages/fig-kiwi/build.js",
      "packages/fig-kiwi/src/fig-kiwi.ts",
      "packages/fig-kiwi/src/schema.ts",
      "packages/fig-kiwi/src/schema-defs.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ["apps/figma-plugin/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { figma: "readonly", __html__: "readonly" },
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.config.{ts,js}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
