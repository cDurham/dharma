import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { toPublicUser } from "../User/user.projection.js";
import { UserService } from "../User/user.service.js";
import { User } from "../User/user.type.js";
import { CreateMemberInput, UpdateMemberInput } from "./member.input.js";
import { toPublicMember } from "./member.projection.js";
import { MemberService } from "./member.service.js";
import { Member } from "./member.type.js";

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
    private readonly userService: UserService,
  ) {}

  @Query(() => Member, { nullable: true })
  async member(@Args("uuid") uuid: string): Promise<Member | null> {
    const row = await this.memberService.get(uuid);
    return row ? toPublicMember(row) : null;
  }

  @Query(() => [Member])
  async members(): Promise<Member[]> {
    const rows = await this.memberService.list();
    return rows.map(toPublicMember);
  }

  @Mutation(() => Member)
  async createMember(@Args("data") data: CreateMemberInput): Promise<Member> {
    return toPublicMember(await this.memberService.create(data));
  }

  @Mutation(() => Member)
  async updateMember(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateMemberInput,
  ): Promise<Member> {
    return toPublicMember(await this.memberService.update(uuid, data));
  }

  @Mutation(() => Member)
  async deleteMember(@Args("uuid") uuid: string): Promise<Member> {
    return toPublicMember(await this.memberService.remove(uuid));
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: Member): Promise<User | null> {
    if (!member.userUuid) {
      return null;
    }
    const row = await this.userService.get(member.userUuid);
    return row ? toPublicUser(row) : null;
  }
}
