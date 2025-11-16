import { EventsHandler, type IEventHandler } from "@nestjs/cqrs";
import { KafkaService } from "../../kafka/kafka.service.js";
import { UserUpdatedEvent } from "./user-updated.event.js";

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
