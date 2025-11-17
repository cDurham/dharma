import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "../BaseEntity/base.entity.js";

@ObjectType("Retreat")
export class Retreat extends BaseEntity {
  @Field()
  name!: string;

  @Field()
  startAt!: Date;

  @Field()
  endAt!: Date;
}
