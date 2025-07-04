import { User } from "../../User";

export class AuthLoginUserCommand {
  constructor(public readonly user: User) {}
}
