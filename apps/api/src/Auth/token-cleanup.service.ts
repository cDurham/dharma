import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { RefreshToken } from "./refresh-token.entity";

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>
  ) {}

  // Run every Sunday at 3:00 AM
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupExpiredTokens() {
    this.logger.log("Starting refresh token cleanup...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      // Delete tokens that expired more than 7 days ago OR are revoked and older than 7 days
      const result = await this.refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .where("expiresAt < :sevenDaysAgo", { sevenDaysAgo })
        .orWhere("isRevoked = :isRevoked AND createdAt < :sevenDaysAgo", {
          isRevoked: true,
          sevenDaysAgo,
        })
        .execute();

      this.logger.log(
        `Cleanup complete. Deleted ${result.affected} refresh token(s).`
      );
    } catch (error) {
      this.logger.error("Error during token cleanup:", error);
    }
  }
}

