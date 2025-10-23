import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserCreatedEvent } from "./user-created.event";
import { KafkaService } from "../../kafka/kafka.service";

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: UserCreatedEvent) {
    await this.kafkaService.produce(
      "users",
      { userUuid: event.userUuid },
      "user-created"
    );
    console.log("User created event published", event);
  }
}
