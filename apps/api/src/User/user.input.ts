import { Field, InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input.js";

@InputType()
export class CreateUserInput extends PersonInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UpdateUserInput extends UpdatePersonInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;
}
