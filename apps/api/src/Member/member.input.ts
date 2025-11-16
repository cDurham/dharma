import { PersonInput, UpdatePersonInput } from "../Person/person.input";
import type { Member } from "./member.entity";

export class CreateMemberInput extends PersonInput implements Partial<Member> {}

export class UpdateMemberInput
  extends UpdatePersonInput
  implements Partial<Member> {}
