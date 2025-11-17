import { Command } from "@nestjs/cqrs";

export class AuthRevokeRefreshTokenCommand extends Command<void> {
  constructor(public readonly token: string) {
    super();
  }
}
