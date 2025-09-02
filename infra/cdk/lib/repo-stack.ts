import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Construct } from "constructs";

interface Props extends StackProps {
  repoName: string;
}

export class DharmaRepoStack extends Stack {
  public readonly repo: ecr.Repository;

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    this.repo = new ecr.Repository(this, "BackendRepo", {
      repositoryName: props.repoName,
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
