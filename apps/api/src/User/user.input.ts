import { Field, InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input.js";
import type { UserEntity } from "./user.entity.js";

@InputType()
export class CreateUserInput
  extends PersonInput
  implements Partial<UserEntity>
{
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class UpdateUserInput
  extends UpdatePersonInput
  implements Partial<UserEntity>
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
