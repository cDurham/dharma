import { Command } from "@nestjs/cqrs";
import type { AuthenticatedUser } from "../../User/user.schema.js";

export class AuthLoginUserCommand extends Command<{
  access_token: string;
  refresh_token: string;
}> {
  constructor(public readonly user: AuthenticatedUser) {
    super();
  }
}
