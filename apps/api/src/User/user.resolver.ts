import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../Auth/current-user.decorator.js";
import { JwtAuthGuard } from "../Auth/jwt-auth.guard.js";
import type { UserRow } from "../db/types.js";
import { CreateUserInput, UpdateUserInput } from "./user.input.js";
import type { AuthenticatedUser } from "./user.schema.js";
import { UserService } from "./user.service.js";
import { User } from "./user.type.js";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(@Args("uuid") uuid: string): Promise<User | null> {
    const row = await this.userService.get(uuid);
    return row ? this.mapToGraphQL(row) : null;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    const rows = await this.userService.list();
    return rows.map((row) => this.mapToGraphQL(row));
  }

  @Mutation(() => User)
  async createUser(@Args("data") data: CreateUserInput): Promise<User> {
    return this.mapToGraphQL(await this.userService.create(data));
  }

  @Mutation(() => User)
  async updateUser(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateUserInput,
  ): Promise<User | null> {
    const row = await this.userService.update(uuid, data);
    return row ? this.mapToGraphQL(row) : null;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("uuid") uuid: string): Promise<boolean> {
    return this.userService.remove(uuid);
  }

  @Query(() => User)
  async getUserByEmail(@Args("email") email: string): Promise<User | null> {
    const row = await this.userService.getByEmail(email);
    return row ? this.mapToGraphQL(row) : null;
  }

  @Mutation(() => Boolean)
  async verifyEmail(@Args("token") token: string): Promise<boolean> {
    return this.userService.verifyEmail(token);
  }

  @Mutation(() => Boolean)
  async resendVerificationEmail(
    @Args("email") email: string,
  ): Promise<boolean> {
    return this.userService.resendVerificationEmail(email);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): User {
    return this.mapToGraphQL(user as unknown as UserRow);
  }

  private mapToGraphQL(row: UserRow): User {
    return {
      uuid: row.uuid,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      verificationToken: row.verificationToken ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
