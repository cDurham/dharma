import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:3000/graphql",
  documents: [
    "src/graphql/**/*.ts",
    "src/graphql/**/*.graphql",
    "!src/graphql/generated.ts",
  ],
  generates: {
    "src/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        addDocBlocks: false,
        apolloClientVersion: 4,
        apolloReactHooksImportFrom: "@apollo/client/react",
        skipTypename: false,
        withComponent: false,
        withHOC: false,
        withHooks: true,
        withMutationFn: false,
        withMutationOptionsType: false,
        withResultType: false,
        withSuspense: false,
      },
    },
  },
};

export default config;
