import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service";
import { RetreatDeletedEvent } from "./retreat-deleted.event";

@EventsHandler(RetreatDeletedEvent)
export class RetreatDeletedHandler
  implements IEventHandler<RetreatDeletedEvent>
{
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: RetreatDeletedEvent) {
    await this.kafkaService.produce(
      "retreats",
      {
        retreatUuid: event.retreatUuid,
      },
      "retreat-deleted"
    );
    console.log("Retreat deleted event published", event);
  }
}
