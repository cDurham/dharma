import { Field, ID, ObjectType } from "@nestjs/graphql";
import { UserRow } from "../db/types";

@ObjectType()
export class User implements UserRow {
  @Field(() => ID)
  uuid!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String)
  email!: string;

  // Password is not exposed in GraphQL
  password!: string;

  @Field(() => String, { nullable: true })
  verificationToken!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
