import { Command } from "@nestjs/cqrs";

export class AuthRefreshAccessTokenCommand extends Command<{ access_token: string; refresh_token: string }> {
  constructor(public readonly refreshTokenString: string) {
    super();
  }
}
