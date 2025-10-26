import { Injectable, Logger } from "@nestjs/common";
import { OutboxService } from "./outbox.service";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    private readonly outboxService: OutboxService,
    private readonly kafkaService: KafkaService
  ) {}

  private resolveTopic(aggregateType?: string): string {
    switch (aggregateType) {
      case "User":
        return "users";
      case "Member":
        return "members";
      default:
        return "domain-events";
    }
  }

  async processPending(batchSize = 100) {
    const items = await this.outboxService.getPendingEvents(batchSize);
    for (const item of items) {
      try {
        const payload = item.payload as any;
        const topic = this.resolveTopic(payload?.aggregateType);
        const key = payload?.eventType ?? item.eventType;
        await this.kafkaService.produce(topic, payload, key);
        await this.outboxService.markProcessed(item.id);
      } catch (err) {
        this.logger.error(`Outbox publish failed for ${item.id}`, err as any);
        // Leave as pending for retry on next cycle
      }
    }
  }
}
