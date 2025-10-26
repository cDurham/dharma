import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "../Auth/jwt-auth.guard";
import { CurrentUser } from "../Auth/current-user.decorator";
import { CreateUserInput, UpdateUserInput, User } from ".";
import { CreateUserCommand } from "./command/create-user.command";
import { DeleteUserCommand } from "./command/delete-user.command";
import { GetUserByEmailQuery } from "./command/get-user-by-email.query";
import { GetUserQuery } from "./command/get-user.query";
import { GetUsersQuery } from "./command/get-users.query";
import { UpdateUserCommand } from "./command/update-user.command";
import { VerifyEmailCommand } from "./command/verify-email.command";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  @Query((returns) => User)
  async user(@Args("uuid") uuid: string): Promise<User | null> {
    const result = await this.queryBus.execute(new GetUserQuery(uuid));
    return result;
  }

  @Query((returns) => [User])
  async users(): Promise<User[]> {
    const result = await this.queryBus.execute(new GetUsersQuery());
    return result;
  }

  @Mutation((returns) => User)
  async createUser(@Args("data") data: CreateUserInput): Promise<User> {
    const result = await this.commandBus.execute(new CreateUserCommand(data));
    return result;
  }

  @Mutation((returns) => User)
  async updateUser(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateUserInput
  ): Promise<User | null> {
    const result = await this.commandBus.execute(
      new UpdateUserCommand(uuid, data)
    );
    return result;
  }

  @Mutation((returns) => Boolean)
  async deleteUser(@Args("uuid") uuid: string): Promise<boolean> {
    const result = await this.commandBus.execute(new DeleteUserCommand(uuid));
    return result;
  }

  @Query((returns) => User)
  async getUserByEmail(@Args("email") email: string): Promise<User | null> {
    const result = await this.queryBus.execute(new GetUserByEmailQuery(email));
    return result;
  }

  @Mutation((returns) => Boolean)
  async verifyEmail(@Args("token") token: string): Promise<boolean> {
    const result = await this.commandBus.execute(new VerifyEmailCommand(token));
    return result;
  }

  @Query((returns) => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
