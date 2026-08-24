import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import type { MemberRow, UserRow } from "../db/types.js";
import { UserService } from "../User/user.service.js";
import { User } from "../User/user.type.js";
import { CreateMemberInput, UpdateMemberInput } from "./member.input.js";
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
    return row ? this.mapToGraphQL(row) : null;
  }

  @Query(() => [Member])
  async members(): Promise<Member[]> {
    const rows = await this.memberService.list();
    return rows.map((row) => this.mapToGraphQL(row));
  }

  @Mutation(() => Member)
  async createMember(@Args("data") data: CreateMemberInput): Promise<Member> {
    return this.mapToGraphQL(await this.memberService.create(data));
  }

  @Mutation(() => Member)
  async updateMember(
    @Args("uuid") uuid: string,
    @Args("data") data: UpdateMemberInput,
  ): Promise<Member> {
    return this.mapToGraphQL(await this.memberService.update(uuid, data));
  }

  @Mutation(() => Member)
  async deleteMember(@Args("uuid") uuid: string): Promise<Member> {
    return this.mapToGraphQL(await this.memberService.remove(uuid));
  }

  @ResolveField(() => User, { nullable: true })
  async user(@Parent() member: Member): Promise<User | null> {
    if (!member.userUuid) {
      return null;
    }
    const row = await this.userService.get(member.userUuid);
    return row ? this.mapUserToGraphQL(row) : null;
  }

  private mapToGraphQL(row: MemberRow): Member {
    return {
      uuid: row.uuid,
      firstName: row.firstName,
      lastName: row.lastName,
      joinDate: row.joinDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      userUuid: row.userUuid ?? null,
    };
  }

  private mapUserToGraphQL(row: UserRow): User {
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
