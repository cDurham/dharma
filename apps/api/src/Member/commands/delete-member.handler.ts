import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteMemberCommand } from "./delete-member.command";
import { Member } from "../member.entity";
import { MemberRepository } from "../member-repository";

@CommandHandler(DeleteMemberCommand)
export class DeleteMemberHandler implements ICommandHandler<DeleteMemberCommand> {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute({ memberUuid }: DeleteMemberCommand): Promise<Member> {
    const aggregate = await this.memberRepository.load(memberUuid);
    if (!aggregate) {
      throw new Error("Member not found");
    }

    const stateBefore = aggregate.getState()!;
    aggregate.delete();
    await this.memberRepository.save(aggregate);

    return {
      uuid: stateBefore.uuid,
      firstName: stateBefore.firstName,
      lastName: stateBefore.lastName,
      joinDate: stateBefore.joinDate,
      createdAt: stateBefore.createdAt!,
      updatedAt: stateBefore.updatedAt!,
      user: null,
      userUuid: null,
    };
  }
}
