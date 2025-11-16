import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import type { KafkaService } from "../../kafka/kafka.service";
import { UserUpdatedEvent } from "./user-updated.event";

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: UserUpdatedEvent) {
    await this.kafkaService.produce(
      "users",
      { userUuid: event.userUuid },
      "user-updated",
    );
    console.log("User updated event published", event);
  }
}
