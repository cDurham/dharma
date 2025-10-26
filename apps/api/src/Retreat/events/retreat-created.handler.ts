import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service";
import { RetreatCreatedEvent } from "./retreat-created.event";

@EventsHandler(RetreatCreatedEvent)
export class RetreatCreatedHandler
  implements IEventHandler<RetreatCreatedEvent>
{
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: RetreatCreatedEvent) {
    await this.kafkaService.produce(
      "retreats",
      {
        retreatUuid: event.retreatUuid,
        name: event.name,
        startAt: event.startAt,
        endAt: event.endAt,
      },
      "retreat-created"
    );
    console.log("Retreat created event published", event);
  }
}
