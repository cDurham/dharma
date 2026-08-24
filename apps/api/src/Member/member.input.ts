import { InputType } from "@nestjs/graphql";
import { PersonInput, UpdatePersonInput } from "../Person/person.input.js";

@InputType()
export class CreateMemberInput extends PersonInput {}

@InputType()
export class UpdateMemberInput extends UpdatePersonInput {}
