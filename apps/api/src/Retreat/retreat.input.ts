import { Field, InputType } from "@nestjs/graphql";
import type { RetreatEntity } from "./retreat.entity.js";

@InputType()
export class CreateRetreatInput implements Partial<RetreatEntity> {
  @Field()
  name!: string;

  @Field()
  startAt!: Date;

  @Field()
  endAt!: Date;
}

@InputType()
export class UpdateRetreatInput implements Partial<RetreatEntity> {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  startAt?: Date;

  @Field({ nullable: true })
  endAt?: Date;
}

@InputType()
export class DeleteRetreatInput {
  @Field()
  uuid!: string;
}
