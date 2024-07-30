import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("airbnb-base"),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
      },

      ecmaVersion: "latest",
      sourceType: "script",
    },

    rules: {
      "linebreak-style": "off",

      indent: [
        "error",
        2,
        {
          SwitchCase: 1,
        },
      ],

      "comma-dangle": ["error", "always-multiline"],
      "no-underscore-dangle": "off",
      "arrow-parens": ["error", "as-needed"],
      "no-prototype-builtins": "off",

      "max-len": [
        "error",
        160,
        {
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreComments: true,
        },
      ],

      "no-param-reassign": "off",
      "no-plusplus": "off",
      "newline-per-chained-call": "off",
      "no-new": "off",
      "no-template-curly-in-string": "off",
      "no-alert": "off",
      "no-console": "off",
      "no-return-assign": ["error", "except-parens"],
      "no-restricted-globals": "off",
      "import/no-unresolved": "off",
      "no-use-before-define": "off",
      "global-require": "off",
      "no-cond-assign": ["error", "except-parens"],
      "wrap-iife": ["error", "any"],
      "quotes": ["warn", "double"],

      "space-before-function-paren": [
        "error",
        {
          anonymous: "never",
          named: "never",
          asyncArrow: "never",
        },
      ],

      strict: ["error", "function"],

      camelcase: [
        "error",
        {
          ignoreGlobals: true,
        },
      ],

      "func-names": ["error", "as-needed"],

      "lines-between-class-members": [
        "error",
        "always",
        {
          exceptAfterSingleLine: true,
        },
      ],
    },
  },
];
