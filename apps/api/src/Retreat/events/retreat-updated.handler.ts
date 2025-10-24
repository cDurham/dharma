import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service";
import { RetreatUpdatedEvent } from "./retreat-updated.event";

@EventsHandler(RetreatUpdatedEvent)
export class RetreatUpdatedHandler
  implements IEventHandler<RetreatUpdatedEvent>
{
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: RetreatUpdatedEvent) {
    await this.kafkaService.produce(
      "retreats",
      {
        retreatUuid: event.retreatUuid,
      },
      "retreat-updated"
    );
    console.log("Retreat updated event published", event);
  }
}
