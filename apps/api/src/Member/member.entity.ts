import { Field, ObjectType } from "@nestjs/graphql";
import { MemberRow } from "../db/types";
import { User } from "../User/user.entity";

@ObjectType({ description: "Member" })
export class Member implements Omit<MemberRow, "userUuid"> {
  @Field(() => String)
  uuid!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => Date)
  joinDate!: Date;

  // GraphQL exposes User, DB stores userUuid
  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  // Not exposed in GraphQL but exists in DB
  userUuid?: string | null;
}
