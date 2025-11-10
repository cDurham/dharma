import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { refreshToken } from "../../db/schema";
import { AuthRevokeRefreshTokenCommand } from "./auth-revoke-refresh-token.command";
import { hashToken } from "../utils";

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
