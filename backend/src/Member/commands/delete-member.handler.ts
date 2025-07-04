import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { DeleteMemberCommand } from "./delete-member.command";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../member.entity";
import { MemberDeletedEvent } from "../events/member-deleted.event";

@CommandHandler(DeleteMemberCommand)
export class DeleteMemberHandler
  implements ICommandHandler<DeleteMemberCommand>
{
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly eventBus: EventBus
  ) {}

  async execute({ memberUuid }: DeleteMemberCommand): Promise<Member> {
    const member = await this.memberRepo.findOneBy({ uuid: memberUuid });

    if (!member) {
      throw new Error("Member not found");
    }

    await this.memberRepo.delete(member);

    this.eventBus.publish(new MemberDeletedEvent(member.uuid));

    return member;
  }
}
