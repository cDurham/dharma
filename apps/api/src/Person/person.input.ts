import { Field, InputType } from "@nestjs/graphql";

@InputType({ isAbstract: true })
export class PersonInput {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;
}

@InputType({ isAbstract: true })
export class UpdatePersonInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
