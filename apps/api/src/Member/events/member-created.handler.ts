import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import type { KafkaService } from "../../kafka/kafka.service";
import { MemberCreatedEvent } from "./member-created.event";

@EventsHandler(MemberCreatedEvent)
export class MemberCreatedHandler implements IEventHandler<MemberCreatedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: MemberCreatedEvent) {
    await this.kafkaService.produce(
      "members",
      {
        memberUuid: event.memberUuid,
        firstName: event.firstName,
      },
      "member-created",
    );
    console.log("Member created event published", event);
  }
}
