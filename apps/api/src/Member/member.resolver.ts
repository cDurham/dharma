// resolver/MemberResolver.ts
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { GetUserQuery } from "../User/command/get-user.query.js";
import type { UserEntity } from "../User/user.entity.js";
import { User } from "../User/user.type.js";
import { CreateMemberCommand } from "./commands/create-member.command.js";
import { DeleteMemberCommand } from "./commands/delete-member.command.js";
import { GetMemberQuery } from "./commands/get-member.query.js";
import { GetMembersQuery } from "./commands/get-members.query.js";
import { UpdateMemberCommand } from "./commands/update-member.command.js";
import { CreateMemberInput, UpdateMemberInput } from "./member.input.js";
import { Member } from "./member.type.js";

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Query(() => Member, { nullable: true })
  async member(@Args("uuid") uuid: string): Promise<Member | null> {
    return this.queryBus.execute(new GetMemberQuery(uuid));
  }

  @Query(() => [Member])
  async members(): Promise<Member[]> {
    return this.queryBus.execute(new GetMembersQuery());
  }

  @Mutation(() => Member)
  async createMember(@Args("data") data: CreateMemberInput): Promise<Member> {
    return this.commandBus.execute(new CreateMemberCommand(data));
  }

  @Mutation(() => Member)
  async updateMember(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateMemberInput,
  ): Promise<Member> {
    return this.commandBus.execute(new UpdateMemberCommand(uuid, data));
  }

  @Mutation(() => Member)
  async deleteMember(@Args("uuid") uuid: string): Promise<Member> {
    return this.commandBus.execute(new DeleteMemberCommand(uuid));
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: Member): Promise<User | null> {
    if (!member.userUuid) {
      return null;
    }

    return this.queryBus.execute(new GetUserQuery(member.userUuid));
  }
}
