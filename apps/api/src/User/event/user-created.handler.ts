import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Logger } from "@nestjs/common";
import { UserCreatedEvent } from "./user-created.event";
import { KafkaService } from "../../kafka/kafka.service";
import { EmailService } from "../../Email/email.service";

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly emailService: EmailService
  ) {}

  async handle(event: UserCreatedEvent) {
    // Publish to Kafka for other services
    await this.kafkaService.produce(
      "users",
      { 
        userUuid: event.userUuid,
        email: event.email,
        firstName: event.firstName,
      },
      "user-created"
    );
    
    this.logger.log(`User created event published to Kafka: ${event.userUuid}`);

    // Send verification email - if it fails, log but don't throw
    // This allows Kafka publishing to succeed even if email fails
    try {
      await this.emailService.sendVerificationEmail(
        event.email,
        event.verificationToken
      );
      this.logger.log(`Verification email sent to: ${event.email}`);
    } catch (error) {
      // Email failed but user is created and Kafka was notified
      // In production, you might want to:
      // 1. Publish a UserVerificationEmailFailedEvent
      // 2. Queue for retry (Bull/BullMQ)
      // 3. Store in dead letter queue
      this.logger.error(
        `Failed to send verification email to ${event.email}:`,
        error
      );
      // Don't throw - let other side effects succeed
    }
  }
}
