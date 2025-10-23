import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Request, Response } from "express";

import { AuthModule } from "./Auth";
import { KafkaModule } from "./kafka/kafka.module";
import { MemberModule } from "./Member/member.module";
import { RetreatModule } from "./Retreat";
import { UserModule } from "./User";
import { VerificationController } from "./Verify/verify.controller";
import { prodDataSourceOptions } from "./db/data-source";

@Module({
  imports: [
    CqrsModule.forRoot(),
    UserModule,
    MemberModule,
    RetreatModule,
    KafkaModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver,
      introspection: process.env.NODE_ENV !== "production",
      // Use Apollo Sandbox/Explorer instead of deprecated Playground
      plugins:
        process.env.NODE_ENV !== "production"
          ? [ApolloServerPluginLandingPageLocalDefault()]
          : [],
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
    ConfigModule.forRoot(), // This loads the .env file
    AuthModule,
    ThrottlerModule.forRoot([
      {
        limit: 10,
        ttl: 60000, // 60 seconds
      },
    ]),
    TypeOrmModule.forRoot(prodDataSourceOptions),
  ],
  controllers: [VerificationController],
  providers: [],
})
export class AppModule {}
