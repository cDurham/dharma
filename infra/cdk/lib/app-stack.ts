import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as logs from "aws-cdk-lib/aws-logs";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";

interface Props extends StackProps {
  ecrRepoName: string;
  imageTag: string;
}

export class DharmaAppStack extends Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    // --- Networking
    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0, // keep costs low; tasks get public IPs
    });

    // --- RDS (Postgres)
    const dbSecret = new rds.DatabaseSecret(this, "DbCredentials", {
      username: "dharma_app",
    });
    const db = new rds.DatabaseInstance(this, "Postgres", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_3,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromSecret(dbSecret),
      allocatedStorage: 20,
      multiAz: false,
      publiclyAccessible: false,
      removalPolicy: RemovalPolicy.SNAPSHOT,
      deleteAutomatedBackups: false,
      databaseName: "dharma_db",
    });

    // --- ECS / ALB
    const cluster = new ecs.Cluster(this, "Cluster", { vpc });

    const taskLogGroup = new logs.LogGroup(this, "ApiLogs", {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // ECR repo & image
    const repo = ecr.Repository.fromRepositoryName(
      this,
      "BackendRepo",
      props.ecrRepoName
    );
    const image = ecs.ContainerImage.fromEcrRepository(repo, props.imageTag);

    const fargate = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      "Api",
      {
        cluster,
        desiredCount: 1,
        cpu: 512,
        memoryLimitMiB: 1024,
        assignPublicIp: true, // no NAT
        taskImageOptions: {
          image,
          containerPort: 3000, // backend listens here
          enableLogging: true,
          logDriver: ecs.LogDrivers.awsLogs({
            streamPrefix: "api",
            logGroup: taskLogGroup,
          }),
          environment: {
            NODE_ENV: "production",
            DB_DATABASE: "dharma_db",
            // FRONTEND_URL set below after CloudFront is created
          },
          secrets: {
            DB_HOST: ecs.Secret.fromSecretsManager(dbSecret, "host"),
            DB_PORT: ecs.Secret.fromSecretsManager(dbSecret, "port"),
            DB_USER: ecs.Secret.fromSecretsManager(dbSecret, "username"),
            DB_PASSWORD: ecs.Secret.fromSecretsManager(dbSecret, "password"),
          },
        },
        publicLoadBalancer: true,
      }
    );

    // Allow ECS tasks to reach Postgres
    db.connections.allowFrom(fargate.service, ec2.Port.tcp(5432));

    // Health check expects /health (we add a tiny controller)
    fargate.targetGroup.configureHealthCheck({
      path: "/health",
      healthyHttpCodes: "200",
    });

    // --- Static site bucket
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // --- CloudFront with two origins: S3 (default) + ALB (/graphql)
    const oai = new cloudfront.OriginAccessIdentity(this, "Oai");
    siteBucket.grantRead(
      new iam.CanonicalUserPrincipal(
        oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
      )
    );

    const s3Origin = origins.S3BucketOrigin.withOriginAccessIdentity(
      siteBucket,
      {
        originAccessIdentity: oai,
      }
    );
    const albOrigin = new origins.LoadBalancerV2Origin(fargate.loadBalancer, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
    });

    const dist = new cloudfront.Distribution(this, "WebCdn", {
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.seconds(0),
        },
      ],
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        // Route graphql to the API (no caching, allow POST)
        "/graphql": {
          origin: albOrigin,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      },
    });

    // Now we can safely expose FRONTEND_URL for email verification redirects
    fargate.taskDefinition.defaultContainer?.addEnvironment(
      "FRONTEND_URL",
      `https://${dist.domainName}`
    );

    // Outputs we’ll read in CI
    new CfnOutput(this, "FrontendUrl", { value: `https://${dist.domainName}` });
    new CfnOutput(this, "FrontendBucketName", { value: siteBucket.bucketName });
    new CfnOutput(this, "DistributionId", { value: dist.distributionId });
    new CfnOutput(this, "AlbDnsName", {
      value: fargate.loadBalancer.loadBalancerDnsName,
    });
  }
}
