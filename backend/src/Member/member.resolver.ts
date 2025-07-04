// resolver/MemberResolver.ts
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateMemberCommand } from "./commands/create-member.command";
import { DeleteMemberCommand } from "./commands/delete-member.command";
import { GetMemberQuery } from "./commands/get-member.query";
import { GetMembersQuery } from "./commands/get-members.query";
import { UpdateMemberCommand } from "./commands/update-member.command";
import { Member } from "./member.entity";
import { CreateMemberInput, UpdateMemberInput } from "./member.input";

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus
  ) {}

  @Query((returns) => Member, { nullable: true })
  async member(@Args("uuid") uuid: string): Promise<Member | null> {
    return this.queryBus.execute(new GetMemberQuery(uuid));
  }

  @Query((returns) => [Member])
  async members(): Promise<Member[]> {
    return this.queryBus.execute(new GetMembersQuery());
  }

  @Mutation((returns) => Member)
  async createMember(@Args("data") data: CreateMemberInput): Promise<Member> {
    return this.commandBus.execute(new CreateMemberCommand(data));
  }

  @Mutation((returns) => Member)
  async updateMember(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateMemberInput
  ): Promise<Member> {
    return this.commandBus.execute(new UpdateMemberCommand(uuid, data));
  }

  @Mutation((returns) => Member)
  async deleteMember(@Args("uuid") uuid: string): Promise<Member> {
    return this.commandBus.execute(new DeleteMemberCommand(uuid));
  }
}
