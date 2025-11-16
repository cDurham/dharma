import { Inject } from "@nestjs/common";
import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source.js";
import { DB_TOKEN } from "../../db/database.module.js";
import { refreshToken } from "../../db/schema/index.js";
import { hashToken } from "../utils.js";
import { AuthRevokeRefreshTokenCommand } from "./auth-revoke-refresh-token.command.js";

@CommandHandler(AuthRevokeRefreshTokenCommand)
export class AuthRevokeRefreshTokenHandler
  implements ICommandHandler<AuthRevokeRefreshTokenCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async execute({ token }: AuthRevokeRefreshTokenCommand): Promise<void> {
    const tokenHash = hashToken(token);
    await this.db
      .update(refreshToken)
      .set({ isRevoked: true })
      .where(eq(refreshToken.tokenHash, tokenHash));
  }
}
