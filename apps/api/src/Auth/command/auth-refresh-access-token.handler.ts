import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { RefreshToken } from "../refresh-token.entity";
import { AuthRefreshAccessTokenCommand } from "./auth-refresh-access-token.command";
import { hashToken } from "../utils";
import { authConfig } from "../../config/auth.config";

@CommandHandler(AuthRefreshAccessTokenCommand)
export class AuthRefreshAccessTokenHandler
  implements ICommandHandler<AuthRefreshAccessTokenCommand>
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: AuthRefreshAccessTokenCommand): Promise<string> {
    const tokenHash = hashToken(command.refreshTokenString);
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
      relations: ["user"],
    });

    const isValid =
      refreshToken &&
      (await bcrypt.compare(
        command.refreshTokenString,
        refreshToken.hashedToken
      ));

    if (
      !refreshToken ||
      !isValid ||
      refreshToken.expiresAt < new Date() ||
      refreshToken.isRevoked
    ) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const payload = {
      email: refreshToken.user.email,
      sub: refreshToken.user.uuid,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: authConfig.accessToken.expiresIn,
    });

    return newAccessToken;
  }
}
