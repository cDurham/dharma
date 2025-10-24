import { UnauthorizedException } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { Inject } from "@nestjs/common";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v7 as uuidv7 } from "uuid";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { refreshToken, user } from "../../db/schema";
import { AuthRefreshAccessTokenCommand } from "./auth-refresh-access-token.command";
import { hashToken } from "../utils";
import {
  authConfig,
  getRefreshTokenExpiresInMs,
} from "../../config/auth.config";

@CommandHandler(AuthRefreshAccessTokenCommand)
export class AuthRefreshAccessTokenHandler
  implements ICommandHandler<AuthRefreshAccessTokenCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus
  ) {}

  async execute(command: AuthRefreshAccessTokenCommand): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const tokenHash = hashToken(command.refreshTokenString);

    // Find refresh token with user
    const [oldRefreshToken] = await this.db
      .select({
        token: refreshToken,
        user: user,
      })
      .from(refreshToken)
      .innerJoin(user, eq(refreshToken.userUuid, user.uuid))
      .where(eq(refreshToken.tokenHash, tokenHash));

    const isValid =
      oldRefreshToken &&
      (await bcrypt.compare(
        command.refreshTokenString,
        oldRefreshToken.token.hashedToken
      ));

    if (
      !oldRefreshToken ||
      !isValid ||
      oldRefreshToken.token.expiresAt < new Date() ||
      oldRefreshToken.token.isRevoked
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Revoke the old refresh token
    await this.db
      .update(refreshToken)
      .set({ isRevoked: true })
      .where(eq(refreshToken.tokenHash, tokenHash));

    const payload = {
      email: oldRefreshToken.user.email,
      sub: oldRefreshToken.user.uuid,
    };

    // Create new access token
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: authConfig.accessToken.expiresIn,
    });

    // Create new refresh token (rotation)
    const plainToken = crypto.randomBytes(32).toString("hex");
    const newTokenHash = hashToken(plainToken);
    const hashedToken = await bcrypt.hash(plainToken, 12);
    const expiresDate = new Date(Date.now() + getRefreshTokenExpiresInMs());

    await this.db.insert(refreshToken).values({
      uuid: uuidv7(),
      userUuid: oldRefreshToken.user.uuid,
      tokenHash: newTokenHash,
      hashedToken,
      expiresAt: expiresDate,
      isRevoked: false,
    });

    return {
      access_token: newAccessToken,
      refresh_token: plainToken,
    };
  }
}
