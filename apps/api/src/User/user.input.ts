import { PersonInput, UpdatePersonInput } from "../Person/person.input";
import type { User } from "./user.entity";

export class CreateUserInput extends PersonInput implements Partial<User> {
  email!: string;
  password!: string;
}

export class UpdateUserInput
  extends UpdatePersonInput
  implements Partial<User>
{
  email?: string;
  password?: string;
  verifiedEmail?: boolean;
  verificationToken?: string;
}
