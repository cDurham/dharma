import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "../db/database.module";
import { KafkaModule } from "../kafka/kafka.module";
import { EventStoreService } from "./event-store.service";
import { OutboxService } from "./outbox.service";
import { OutboxPublisherService } from "./outbox-publisher.service";
import { OutboxPublisherScheduler } from "./outbox-publisher.scheduler";

@Module({
  imports: [DatabaseModule, CqrsModule, KafkaModule],
  providers: [EventStoreService, OutboxService, OutboxPublisherService, OutboxPublisherScheduler],
  exports: [EventStoreService, OutboxService, OutboxPublisherService],
})
export class EventStoreModule {}
