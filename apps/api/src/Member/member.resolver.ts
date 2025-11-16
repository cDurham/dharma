// resolver/MemberResolver.ts
import type { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateMemberCommand } from "./commands/create-member.command.js";
import { DeleteMemberCommand } from "./commands/delete-member.command.js";
import { GetMemberQuery } from "./commands/get-member.query.js";
import { GetMembersQuery } from "./commands/get-members.query.js";
import { UpdateMemberCommand } from "./commands/update-member.command.js";
import { Member } from "./member.entity.js";
import type { CreateMemberInput, UpdateMemberInput } from "./member.input.js";

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
}
