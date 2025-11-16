import {
  type CommandBus,
  CommandHandler,
  type ICommandHandler,
} from "@nestjs/cqrs";
import type { JwtService } from "@nestjs/jwt";
import {
  authConfig,
  getRefreshTokenExpiresInMs,
} from "../../config/auth.config";
import { AuthCreateRefreshTokenCommand } from "./auth-create-refresh-token.command";
import { AuthLoginUserCommand } from "./auth-login-user.command";

@CommandHandler(AuthLoginUserCommand)
export class AuthLoginUserHandler
  implements ICommandHandler<AuthLoginUserCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({ user }: AuthLoginUserCommand): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload = { email: user.email, sub: user.uuid };
    const token = this.jwtService.sign(payload, {
      expiresIn: authConfig.accessToken.expiresIn,
    });

    const refreshToken = await this.commandBus.execute(
      new AuthCreateRefreshTokenCommand(
        user.uuid,
        getRefreshTokenExpiresInMs(),
      ),
    );

    return { access_token: token, refresh_token: refreshToken };
  }
}
