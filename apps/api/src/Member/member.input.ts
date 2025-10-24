import { InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input";
import { Member } from "./member.entity";

@InputType()
export class CreateMemberInput extends PersonInput implements Partial<Member> {}

@InputType()
export class UpdateMemberInput
  extends UpdatePersonInput
  implements Partial<Member> {}
