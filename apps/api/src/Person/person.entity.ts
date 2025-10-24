import { Field, ID, ObjectType } from "@nestjs/graphql";

/**
 * Person entity - GraphQL abstraction only
 * Not backed by a database table (using concrete table inheritance)
 */
@ObjectType()
export class Person {
  @Field(() => ID)
  uuid!: string;

  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
