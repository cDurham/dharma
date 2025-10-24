import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RetreatRow } from "../db/types";

@ObjectType({ description: "Retreat" })
export class Retreat implements RetreatRow {
  @Field(() => ID)
  uuid!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Date)
  startAt!: Date;

  @Field(() => Date)
  endAt!: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
