import { Inject } from "@nestjs/common";
import { CommandHandler, type ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";

import type { db as DbType } from "../../db/data-source";
import { DB_TOKEN } from "../../db/database.module";
import { refreshToken } from "../../db/schema";
import { hashToken } from "../utils";
import { AuthRevokeRefreshTokenCommand } from "./auth-revoke-refresh-token.command";

@CommandHandler(AuthRevokeRefreshTokenCommand)
export class AuthRevokeRefreshTokenHandler
  implements ICommandHandler<AuthRevokeRefreshTokenCommand>
{
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType
  ) {}

  async execute({ token }: AuthRevokeRefreshTokenCommand): Promise<void> {
    const tokenHash = hashToken(token);
    await this.db
      .update(refreshToken)
      .set({ isRevoked: true })
      .where(eq(refreshToken.tokenHash, tokenHash));
  }
}
