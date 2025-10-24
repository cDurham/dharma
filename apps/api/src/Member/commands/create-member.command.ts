import { CreateMemberInput } from "../member.input";

export class CreateMemberCommand {
  constructor(public readonly input: CreateMemberInput) {}
}
