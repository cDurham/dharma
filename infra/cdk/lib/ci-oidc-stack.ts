import { Aws, CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface Props extends StackProps {
  githubOwner: string;
  githubRepo: string;
}

export class DharmaCiOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // OIDC provider for GitHub Actions (created once per account).
    const provider = new iam.OpenIdConnectProvider(this, "GitHubProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
      // Thumbprints omitted – CDK/IAM can determine root CA automatically.
    });

    // Role for GitHub Actions
    const role = new iam.Role(this, "GithubActionsDeployRole", {
      roleName: "GithubActionsDharmaDeployRole",
      assumedBy: new iam.WebIdentityPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
            // Allow any ref in this repo. Later, narrow to e.g. :ref:refs/heads/main
            "token.actions.githubusercontent.com:sub": `repo:${props.githubOwner}/${props.githubRepo}:*`,
          },
        }
      ),
      // Keep it simple now; tighten later to least-privilege.
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    new CfnOutput(this, "CiRoleArn", { value: role.roleArn });
  }
}
