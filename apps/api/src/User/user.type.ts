import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "../BaseEntity/base.entity.js";

@ObjectType("User")
export class User extends BaseEntity {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field()
  email!: string;
}
