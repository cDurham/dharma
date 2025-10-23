import { UpdateMemberInput } from "../member.input";

export class UpdateMemberCommand {
  constructor(
    public readonly memberUuid: string,
    public readonly data: UpdateMemberInput
  ) {}
}
