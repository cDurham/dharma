import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler, QueryBus } from "@nestjs/cqrs";
import bcrypt from "bcryptjs";
import { GetUserByEmailQuery } from "../../User/command/get-user-by-email.query";
import { ValidateUserCommand } from "./auth-validate-user.command";

@CommandHandler(ValidateUserCommand)
export class ValidateUserHandler
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(private readonly queryBus: QueryBus) {}

  async execute({ input }: ValidateUserCommand) {
    const { email, password } = input;
    const user = await this.queryBus.execute(new GetUserByEmailQuery(email));
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    if (user.verificationToken !== null) {
      throw new UnauthorizedException("Email not verified");
    }

    const { password: _, ...result } = user;
    return result;
  }
}
