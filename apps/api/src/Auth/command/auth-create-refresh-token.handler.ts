// src/Auth/command/auth-create-refresh-token.handler.ts
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Repository } from "typeorm";
import { RefreshToken } from "../refresh-token.entity";
import { AuthCreateRefreshTokenCommand } from "./auth-create-refresh-token.command";
import { hashToken } from "../utils";

@CommandHandler(AuthCreateRefreshTokenCommand)
export class AuthCreateRefreshTokenHandler
  implements ICommandHandler<AuthCreateRefreshTokenCommand>
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>
  ) {}

  public async execute(
    command: AuthCreateRefreshTokenCommand
  ): Promise<string> {
    const { userId, expiresIn } = command;

    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(plainToken);
    const hashedToken = await bcrypt.hash(plainToken, 12);
    const expiresDate = new Date(Date.now() + expiresIn);

    const refreshToken = this.refreshTokenRepo.create({
      user: { uuid: userId },
      tokenHash,
      hashedToken,
      expiresAt: expiresDate,
      isRevoked: false,
    });

    await this.refreshTokenRepo.save(refreshToken);

    return plainToken;
  }
}
