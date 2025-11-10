import { Command } from "@nestjs/cqrs";
import { AuthenticatedUser } from "../../User/user.schema";

export class AuthLoginUserCommand extends Command<{
  access_token: string;
  refresh_token: string;
}> {
  constructor(public readonly user: AuthenticatedUser) {
    super();
  }
}
