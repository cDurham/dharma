import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Member } from "../member.entity";
import { CreateMemberCommand } from "./create-member.command";
import { MemberRepository } from "../member-repository";
import { MemberAggregate } from "../member.aggregate";

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler implements ICommandHandler<CreateMemberCommand> {
  constructor(private readonly memberRepository: MemberRepository) {}

  async execute(command: CreateMemberCommand): Promise<Member> {
    const { firstName, lastName } = command.input;

    const aggregate = MemberAggregate.create({ firstName, lastName });
    await this.memberRepository.save(aggregate);

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
