import { UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../Auth/current-user.decorator.js";
import { JwtAuthGuard } from "../Auth/jwt-auth.guard.js";
import { CreateUserCommand } from "./command/create-user.command.js";
import { DeleteUserCommand } from "./command/delete-user.command.js";
import { GetUserByEmailQuery } from "./command/get-user-by-email.query.js";
import { GetUserQuery } from "./command/get-user.query.js";
import { GetUsersQuery } from "./command/get-users.query.js";
import { UpdateUserCommand } from "./command/update-user.command.js";
import { VerifyEmailCommand } from "./command/verify-email.command.js";
import type { AuthenticatedUser } from "./user.schema.js";
import { User } from "./user.type.js";
import type { UserEntity } from "./user.entity.js";
import { CreateUserInput, UpdateUserInput } from "./user.input.js";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => User)
  async user(@Args("uuid") uuid: string): Promise<User | null> {
    const entity = await this.queryBus.execute(new GetUserQuery(uuid));
    return entity ? this.mapToGraphQL(entity) : null;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    const result = await this.queryBus.execute(new GetUsersQuery());
    return result.map((entity) => this.mapToGraphQL(entity));
  }

  @Mutation(() => User)
  async createUser(@Args("data") data: CreateUserInput): Promise<User> {
    const entity = await this.commandBus.execute(
      new CreateUserCommand(data),
    );
    return this.mapToGraphQL(entity);
  }

  @Mutation(() => User)
  async updateUser(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateUserInput,
  ): Promise<User | null> {
    const entity = await this.commandBus.execute(
      new UpdateUserCommand(uuid, data),
    );
    return entity ? this.mapToGraphQL(entity) : null;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("uuid") uuid: string): Promise<boolean> {
    const result = await this.commandBus.execute(new DeleteUserCommand(uuid));
    return result;
  }

  @Query(() => User)
  async getUserByEmail(@Args("email") email: string): Promise<User | null> {
    const entity = await this.queryBus.execute(new GetUserByEmailQuery(email));
    return entity ? this.mapToGraphQL(entity) : null;
  }

  @Mutation(() => Boolean)
  async verifyEmail(@Args("token") token: string): Promise<boolean> {
    const result = await this.commandBus.execute(new VerifyEmailCommand(token));
    return result;
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): User {
    return this.mapToGraphQL(user as unknown as UserEntity);
  }

  private mapToGraphQL(entity: UserEntity): User {
    return {
      uuid: entity.uuid,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      verificationToken: entity.verificationToken ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
