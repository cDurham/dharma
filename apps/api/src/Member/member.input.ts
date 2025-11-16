import { PersonInput, UpdatePersonInput } from "../Person/person.input.js";
import type { Member } from "./member.entity.js";

export class CreateMemberInput extends PersonInput implements Partial<Member> {}

export class UpdateMemberInput
  extends UpdatePersonInput
  implements Partial<Member> {}
