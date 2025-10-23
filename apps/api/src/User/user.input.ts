import { Field, InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input";
import { User } from "./user.entity";

@InputType()
export class CreateUserInput extends PersonInput implements Partial<User> {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UpdateUserInput
  extends UpdatePersonInput
  implements Partial<User>
{
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  verifiedEmail?: boolean;

  @Field({ nullable: true })
  verificationToken?: string;
}
