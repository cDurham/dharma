import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberUpdatedEvent } from "../events/member-updated.event";
import { Member } from "../member.entity";
import { UpdateMemberCommand } from "./update-member.command";

@CommandHandler(UpdateMemberCommand)
export class UpdateMemberHandler
  implements ICommandHandler<UpdateMemberCommand>
{
  constructor(
    @InjectRepository(Member)
    private readonly eventBus: EventBus,
    private readonly memberRepo: Repository<Member>
  ) {}

  async execute({ memberUuid, data }: UpdateMemberCommand): Promise<Member> {
    const member = await this.memberRepo.findOneBy({ uuid: memberUuid });

    if (!member) {
      throw new Error("Member not found");
    }

    Object.assign(member, data);

    await this.memberRepo.save(member);

    this.eventBus.publish(new MemberUpdatedEvent(member.uuid));

    return member;
  }
}
