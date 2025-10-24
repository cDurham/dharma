import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
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
    ConfigModule.forRoot(), // This loads the .env file
    ScheduleModule.forRoot(), // Enable cron jobs globally
    UserModule,
    MemberModule,
    RetreatModule,
    KafkaModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver,
      introspection: process.env.NODE_ENV !== "production",
      // Apollo Server 5 includes a default landing page plugin automatically
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
    }),
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
