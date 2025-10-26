import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Member } from "../member.entity";
import { UpdateMemberCommand } from "./update-member.command";
import { MemberRepository } from "../member-repository";
import { filterUndefined } from "../../EventStore/utils";

@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler implements ICommandHandler<UpdateMemberCommand> {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute({ memberUuid, data }: UpdateMemberCommand): Promise<Member> {
    const aggregate = await this.memberRepository.load(memberUuid);
    if (!aggregate) {
      throw new Error("Member not found");
    }

    const changes = filterUndefined({
      firstName: data.firstName,
      lastName: data.lastName,
    });

    if (Object.keys(changes).length > 0) {
      aggregate.update(changes);
      await this.memberRepository.save(aggregate);
    }

    const state = aggregate.getState()!;
    return {
      uuid: state.uuid,
      firstName: state.firstName,
      lastName: state.lastName,
      joinDate: state.joinDate,
      createdAt: state.createdAt!,
      updatedAt: state.updatedAt!,
      user: null,
      userUuid: null,
    };
  }
}
