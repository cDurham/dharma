import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v7 as uuidv7 } from "uuid";
import { MemberCreatedEvent } from "../events/member-created.event";
import { Member } from "../member.entity";
import { CreateMemberCommand } from "./create-member.command";

@CommandHandler(CreateMemberCommand)
export class CreateMemberHandler
  implements ICommandHandler<CreateMemberCommand>
{
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateMemberCommand): Promise<Member> {
    const { firstName, lastName } = command.input;

    const newMember = this.memberRepo.create({
      uuid: uuidv7(),
      firstName,
      lastName,
      joinDate: new Date(),
    });

    const savedMember = await this.memberRepo.save(newMember);

    this.eventBus.publish(
      new MemberCreatedEvent(savedMember.uuid, savedMember.firstName)
    );

    return savedMember;
  }
}
