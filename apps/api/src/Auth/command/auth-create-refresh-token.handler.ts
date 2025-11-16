import crypto from "crypto";
import { Inject } from "@nestjs/common";
import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import bcrypt from "bcryptjs";
import { v7 as uuidv7 } from "uuid";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { refreshToken } from "../../db/schema";
import { hashToken } from "../utils";
import { AuthCreateRefreshTokenCommand } from "./auth-create-refresh-token.command";

@CommandHandler(AuthCreateRefreshTokenCommand)
export class AuthCreateRefreshTokenHandler
  implements ICommandHandler<AuthCreateRefreshTokenCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  public async execute(
    command: AuthCreateRefreshTokenCommand
  ): Promise<string> {
    const { userId, expiresIn } = command;

    const plainToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(plainToken);
    const hashedToken = await bcrypt.hash(plainToken, 12);
    const expiresDate = new Date(Date.now() + expiresIn);

    await this.db.insert(refreshToken).values({
      uuid: uuidv7(),
      userUuid: userId,
      tokenHash,
      hashedToken,
      expiresAt: expiresDate,
      isRevoked: false,
    });

    return plainToken;
  }
}
