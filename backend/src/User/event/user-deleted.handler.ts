import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { UserDeletedEvent } from "./user-deleted.event";
import { KafkaService } from "../../kafka/kafka.service";

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  constructor(private readonly kafkaService: KafkaService) {}

  async handle(event: UserDeletedEvent) {
    await this.kafkaService.produce(
      "users",
      { userUuid: event.userUuid },
      "user-deleted"
    );
    console.log("User deleted event published", event);
  }
}
