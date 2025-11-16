import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { and, eq, lt, or } from "drizzle-orm";

import type { db as DbType } from "../db/data-source";
import { DB_TOKEN } from "../db/database.module";
import { refreshToken } from "../db/schema";

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  // Run every Sunday at 3:00 AM
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupExpiredTokens() {
    this.logger.log("Starting refresh token cleanup...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // Delete tokens that expired more than 7 days ago OR are revoked and older than 7 days
      await this.db
        .delete(refreshToken)
        .where(
          or(
            lt(refreshToken.expiresAt, sevenDaysAgo),
            and(
              eq(refreshToken.isRevoked, true),
              lt(refreshToken.createdAt, sevenDaysAgo)
            )
          )
        );

      this.logger.log("Cleanup complete.");
    } catch (error) {
      this.logger.error("Error during token cleanup:", error);
    }
  }
}
