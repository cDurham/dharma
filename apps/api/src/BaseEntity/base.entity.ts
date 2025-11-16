import { Field, ID, ObjectType } from "@nestjs/graphql";

/**
 * Base entity with common fields
 * Not tied to DB schema - just GraphQL abstraction
 */
@ObjectType()
export abstract class BaseEntity {
  @Field(() => ID)
  uuid!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
