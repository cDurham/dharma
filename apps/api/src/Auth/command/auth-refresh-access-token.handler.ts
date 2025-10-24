import { UnauthorizedException } from "@nestjs/common";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Repository } from "typeorm";
import { RefreshToken } from "../refresh-token.entity";
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
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus
  ) {}

  async execute(command: AuthRefreshAccessTokenCommand): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const tokenHash = hashToken(command.refreshTokenString);
    const oldRefreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ["user"],
    });

    const isValid =
      oldRefreshToken &&
      (await bcrypt.compare(
        command.refreshTokenString,
        oldRefreshToken.hashedToken
      ));

    if (
      !oldRefreshToken ||
      !isValid ||
      oldRefreshToken.expiresAt < new Date() ||
      oldRefreshToken.isRevoked
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Revoke the old refresh token
    await this.refreshTokenRepository.update(
      { tokenHash },
      { isRevoked: true }
    );

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

    const newRefreshToken = this.refreshTokenRepository.create({
      user: { uuid: oldRefreshToken.user.uuid },
      tokenHash: newTokenHash,
      hashedToken,
      expiresAt: expiresDate,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: plainToken,
    };
  }
}
