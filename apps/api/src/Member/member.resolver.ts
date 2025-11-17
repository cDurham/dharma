// resolver/MemberResolver.ts
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CreateMemberCommand } from "./commands/create-member.command.js";
import { DeleteMemberCommand } from "./commands/delete-member.command.js";
import { GetMemberQuery } from "./commands/get-member.query.js";
import { GetMembersQuery } from "./commands/get-members.query.js";
import { UpdateMemberCommand } from "./commands/update-member.command.js";
import { GetUserQuery } from "../User/command/get-user.query.js";
import { User } from "../User/user.type.js";
import type { UserEntity } from "../User/user.entity.js";
import { MemberEntity } from "./member.entity.js";
import { Member } from "./member.type.js";
import { CreateMemberInput, UpdateMemberInput } from "./member.input.js";

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => Member, { nullable: true })
  async member(@Args("uuid") uuid: string): Promise<Member | null> {
    const entity = await this.queryBus.execute(new GetMemberQuery(uuid));
    return entity ? this.mapToGraphQL(entity) : null;
  }

  @Query(() => [Member])
  async members(): Promise<Member[]> {
    const entities = await this.queryBus.execute(new GetMembersQuery());
    return entities.map((entity) => this.mapToGraphQL(entity));
  }

  @Mutation(() => Member)
  async createMember(@Args("data") data: CreateMemberInput): Promise<Member> {
    const entity = await this.commandBus.execute(
      new CreateMemberCommand(data),
    );
    return this.mapToGraphQL(entity);
  }

  @Mutation(() => Member)
  async updateMember(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateMemberInput,
  ): Promise<Member> {
    const entity = await this.commandBus.execute(
      new UpdateMemberCommand(uuid, data),
    );
    return this.mapToGraphQL(entity);
  }

  @Mutation(() => Member)
  async deleteMember(@Args("uuid") uuid: string): Promise<Member> {
    const entity = await this.commandBus.execute(
      new DeleteMemberCommand(uuid),
    );
    return this.mapToGraphQL(entity);
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: Member): Promise<User | null> {
    if (!member.userUuid) {
      return null;
    }

    const userEntity = await this.queryBus.execute(
      new GetUserQuery(member.userUuid),
    );

    return userEntity ? this.mapUserToGraphQL(userEntity) : null;
  }

  private mapToGraphQL(entity: MemberEntity): Member {
    return {
      uuid: entity.uuid,
      firstName: entity.firstName,
      lastName: entity.lastName,
      joinDate: entity.joinDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      userUuid: entity.userUuid ?? null,
    };
  }

  private mapUserToGraphQL(user: UserEntity): User {
    return {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verificationToken: user.verificationToken ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
