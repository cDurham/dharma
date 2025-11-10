module.exports = {
  root: true,
  ignorePatterns: ["**/*", "!apps/**/*", "!libs/**/*", "!tools/**/*"],
  plugins: [],
  overrides: [
    // Base TypeScript config for all TS files
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./apps/api/tsconfig*.json", "./apps/web/tsconfig*.json"],
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      plugins: ["@typescript-eslint", "import"],
    },
    // API-specific overrides
    {
      files: ["apps/api/**/*.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    // Web/React-specific config
    {
      files: ["apps/web/**/*.tsx", "apps/web/**/*.ts"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ["react", "react-hooks", "jsx-a11y"],
      settings: {
        react: {
          version: "detect",
        },
      },
    },
    // JavaScript files
    {
      files: ["*.js", "*.cjs", "*.mjs"],
      parserOptions: {
        ecmaVersion: 2021,
      },
      extends: ["eslint:recommended"],
    },
  ],
};
