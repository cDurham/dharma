import { Field, InputType } from "@nestjs/graphql";
import { Retreat } from "./retreat.entity";

@InputType()
export class CreateRetreatInput implements Partial<Retreat> {
  @Field()
  name!: string;

  @Field()
  startAt!: Date;

  @Field()
  endAt!: Date;
}

@InputType()
export class UpdateRetreatInput implements Partial<Retreat> {
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
