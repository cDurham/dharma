import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ApolloDriver } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule } from "@nestjs/throttler";
import type { Request, Response } from "express";

import { AuthModule, GqlThrottlerGuard, JwtAuthGuard } from "./Auth/index.js";
import { DatabaseModule } from "./db/database.module.js";
import { HealthController } from "./health/health.controller.js";
import { MemberModule } from "./Member/member.module.js";
import { RetreatModule } from "./Retreat/index.js";
import { UserModule } from "./User/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
@Module({
  imports: [
    ConfigModule.forRoot(), // This loads the .env file
    ScheduleModule.forRoot(), // Enable cron jobs globally
    DatabaseModule, // Drizzle database module
    UserModule,
    MemberModule,
    RetreatModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: isProduction
        ? true // generate schema in memory in prod to avoid filesystem writes
        : join(__dirname, "schema.gql"),
      sortSchema: true,
      introspection: !isProduction,
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
        limit: 100,
        ttl: 60000, // 60 seconds
        // The E2E suite drives hundreds of requests from one IP.
        skipIf: () => process.env.NODE_ENV === "test",
      },
    ]),
  ],
  controllers: [HealthController],
  // Guard order is registration order: throttle before credential checks.
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
