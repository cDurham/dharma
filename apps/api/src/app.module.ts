import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { AuthModule } from "./Auth/index.js";
import { MemberModule } from "./Member/member.module.js";
import { RetreatModule } from "./Retreat/index.js";
import { UserModule } from "./User/index.js";
import { VerificationController } from "./Verify/verify.controller.js";
import { DatabaseModule } from "./db/database.module.js";
import { KafkaModule } from "./kafka/kafka.module.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const graphqlTypePaths = [join(__dirname, "**/*.graphql")];

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot(), // This loads the .env file
    ScheduleModule.forRoot(), // Enable cron jobs globally
    DatabaseModule, // Drizzle database module
    UserModule,
    MemberModule,
    RetreatModule,
    KafkaModule,
    GraphQLModule.forRoot({
      typePaths: graphqlTypePaths,
      driver: ApolloDriver,
      sortSchema: true,
      introspection: process.env.NODE_ENV !== "production",
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:4200",
        credentials: true,
      },
    }),
    AuthModule,
    ThrottlerModule.forRoot([
      {
        limit: 10,
        ttl: 60000, // 60 seconds
      },
    ]),
  ],
  controllers: [VerificationController],
  providers: [],
})
export class AppModule {}
