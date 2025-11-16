import { Command } from "@nestjs/cqrs";
import { getRefreshTokenExpiresInMs } from "../../config/auth.config";

export class AuthCreateRefreshTokenCommand extends Command<string> {
  constructor(
    public readonly userId: string,
    /**
     * Optional: if you want to track IP / user-agent for security,
     * you could pass them here.
     */
    public readonly expiresIn: number = getRefreshTokenExpiresInMs(),
  ) {
    super();
  }
}
