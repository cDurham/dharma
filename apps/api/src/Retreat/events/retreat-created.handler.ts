import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service.js";
import { RetreatCreatedEvent } from "./retreat-created.event.js";

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
      },
      "retreat-created",
    );
    console.log("Retreat created event published", event);
  }
}
