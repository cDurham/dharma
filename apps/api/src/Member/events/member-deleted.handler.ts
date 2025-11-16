import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service.js";
import { MemberDeletedEvent } from "./member-deleted.event.js";

@EventsHandler(MemberDeletedEvent)
export class MemberDeletedHandler implements IEventHandler<MemberDeletedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: MemberDeletedEvent) {
    await this.kafkaService.produce(
      "members",
      {
        memberUuid: event.memberUuid,
      },
      "member-deleted",
    );
    console.log("Member deleted event published", event);
  }
}
