import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RefreshToken } from "../refresh-token.entity";
import { AuthRevokeRefreshTokenCommand } from "./auth-revoke-refresh-token.command";
import { hashToken } from "../utils";

@CommandHandler(AuthRevokeRefreshTokenCommand)
export class AuthRevokeRefreshTokenHandler
  implements ICommandHandler<AuthRevokeRefreshTokenCommand>
{
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>
  ) {}

  async execute({ token }: AuthRevokeRefreshTokenCommand): Promise<void> {
    const tokenHash = hashToken(token);
    await this.refreshTokenRepo.update({ tokenHash }, { isRevoked: true });
  }
}
