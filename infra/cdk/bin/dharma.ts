#!/usr/bin/env node
import { App, StackProps } from "aws-cdk-lib";
import { DharmaRepoStack } from "../lib/repo-stack";
import { DharmaAppStack } from "../lib/app-stack";
import { DharmaCiOidcStack } from "../lib/ci-oidc-stack";

const app = new App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;
const maybeEnv: StackProps["env"] =
  account && region ? { account, region } : undefined;

// Adjust if you rename the repo/owner
const githubOwner = "cDurham";
const githubRepo = "dharma";

// One-time (or rarely changing) stacks
new DharmaCiOidcStack(app, "DharmaCiOidcStack", {
  env: maybeEnv,
  githubOwner,
  githubRepo,
});
new DharmaRepoStack(app, "DharmaRepoStack", {
  env: maybeEnv,
  repoName: "dharma-backend",
});

// App stack (deploys every commit)
const imageTag = app.node.tryGetContext("imageTag") || "latest";
new DharmaAppStack(app, "DharmaAppStack", {
  env: maybeEnv,
  ecrRepoName: "dharma-backend",
  imageTag,
});
