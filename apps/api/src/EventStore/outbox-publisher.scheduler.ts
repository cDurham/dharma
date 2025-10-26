import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { OutboxPublisherService } from "./outbox-publisher.service";

@Injectable()
export class OutboxPublisherScheduler {
  private readonly logger = new Logger(OutboxPublisherScheduler.name);

  constructor(private readonly publisher: OutboxPublisherService) {}

  @Interval(parseInt(process.env.OUTBOX_POLL_INTERVAL_MS || "5000", 10))
  async handleInterval() {
    this.logger.debug("Polling outbox for pending events...");
    await this.publisher.processPending();
  }
}

