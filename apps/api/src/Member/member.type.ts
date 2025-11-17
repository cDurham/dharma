import { Field, HideField, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "../BaseEntity/base.entity.js";
import { User } from "../User/user.type.js";

@ObjectType("Member")
export class Member extends BaseEntity {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  joinDate!: Date;

  @Field(() => User, { nullable: true })
  user?: User | null;

  @HideField()
  userUuid?: string | null;
}
