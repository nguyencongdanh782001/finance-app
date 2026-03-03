// eslint.config.js
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

import tseslint from "typescript-eslint";
import next from "eslint-config-next";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier";

export default defineConfig([
  /* ================= Ignore ================= */
  globalIgnores([
    // Next defaults
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // From file 1
    "dist/**",
    ".eslint.config.js",
    "vite.config.ts",
  ]),

  /* ================= Base ================= */
  js.configs.recommended,
  ...tseslint.configs.recommended,

  /* ================= Next 16.1 ================= */
  next.configs["core-web-vitals"],
  next.configs["typescript"],

  /* ================= Custom rules ================= */
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier,
    },
    rules: {
      /* ========= Prettier ========= */
      ...prettier.configs.recommended.rules,
      "prettier/prettier": "off",

      /* ========= React Hooks ========= */
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "off",

      /* ========= React Refresh ========= */
      "react-refresh/only-export-components": [
        "off",
        { allowConstantExport: true },
      ],

      /* ========= JS ========= */
      "no-unused-vars": "off",
      "no-param-reassign": ["error", { props: false }],
      "no-array-constructor": "off",
      "no-empty-function": "off",
      "no-extra-semi": "off",
      "no-loss-of-precision": "off",
      "no-underscore-dangle": "off",

      /* ========= TypeScript ========= */
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-array-constructor": "error",
      "@typescript-eslint/no-loss-of-precision": "error",
      "@typescript-eslint/no-empty-interface": [
        "error",
        { allowSingleExtends: false },
      ],
      "@typescript-eslint/no-extra-non-null-assertion": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      "@typescript-eslint/no-non-null-assertion": "error",

      /* ========= React style ========= */
      "react/jsx-filename-extension": "off",
      "react/jsx-no-useless-fragment": "off",
      "react/destructuring-assignment": "off",
      "react/jsx-props-no-spreading": "off",
      "react/function-component-definition": "off",

      /* ========= Others ========= */
      "jsx-a11y/anchor-is-valid": "off",
      "import/prefer-default-export": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
]);
