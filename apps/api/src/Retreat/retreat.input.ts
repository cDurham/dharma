import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateRetreatInput {
  @Field()
  name!: string;

  @Field()
  startAt!: Date;

  @Field()
  endAt!: Date;
}

@InputType()
export class UpdateRetreatInput {
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
