import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service";
import { MemberUpdatedEvent } from "./member-updated.event";

@EventsHandler(MemberUpdatedEvent)
export class MemberUpdatedHandler implements IEventHandler<MemberUpdatedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: MemberUpdatedEvent) {
    await this.kafkaService.produce(
      "members",
      {
        memberUuid: event.memberUuid,
      },
      "member-updated"
    );
    console.log("Member updated event published", event);
  }
}
