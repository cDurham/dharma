import { InputType, Field } from "@nestjs/graphql";
import { Person } from "./person.entity";

@InputType()
export class PersonInput implements Partial<Person> {
  @Field()
  firstName!: string;

  @Field()
  lastName!: string;
}

@InputType()
export class UpdatePersonInput implements Partial<Person> {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
