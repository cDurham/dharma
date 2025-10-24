import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserUpdatedEvent } from "./user-updated.event";
import { KafkaService } from "../../kafka/kafka.service";

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: UserUpdatedEvent) {
    await this.kafkaService.produce(
      "users",
      { userUuid: event.userUuid },
      "user-updated"
    );
    console.log("User updated event published", event);
  }
}
