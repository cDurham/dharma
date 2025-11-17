import { Field, InputType } from "@nestjs/graphql";
import type { Person } from "./person.entity.js";

@InputType({ isAbstract: true })
export class PersonInput implements Partial<Person> {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;
}

@InputType({ isAbstract: true })
export class UpdatePersonInput implements Partial<Person> {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
