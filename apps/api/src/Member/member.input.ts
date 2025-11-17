import { InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input.js";
import type { MemberEntity } from "./member.entity.js";

@InputType()
export class CreateMemberInput
  extends PersonInput
  implements Partial<MemberEntity> {}

@InputType()
export class UpdateMemberInput
  extends UpdatePersonInput
  implements Partial<MemberEntity> {}
