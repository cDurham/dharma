import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer, Consumer, Partitioners } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private isConnected = false;

  constructor() {
    // Only initialize Kafka if brokers are configured
    if (process.env.KAFKA_BROKERS) {
      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID,
        brokers: (process.env.KAFKA_BROKERS || "").split(","),
      });
      this.producer = this.kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
      });
      this.consumer = this.kafka.consumer({ groupId: "my-group" });
    }
  }

  async onModuleInit() {
    // Kafka is optional - skip if not configured
    if (!process.env.KAFKA_BROKERS) {
      console.log("⚠️  Kafka disabled - KAFKA_BROKERS not configured");
      return;
    }

    if (!this.producer || !this.consumer) {
      console.warn("⚠️  Kafka not initialized - skipping connection");
      return;
    }

    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
      console.log("✅ Kafka connected successfully");
    } catch (error) {
      console.warn(
        "⚠️  Kafka connection failed (non-critical):",
        error instanceof Error ? error.message : error
      );
      console.log(
        "📝 Application will continue without Kafka event publishing"
      );
    }
  }

  async onModuleDestroy() {
    if (!this.isConnected || !this.producer || !this.consumer) {
      return;
    }

    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      console.log("Kafka disconnected");
    } catch (error) {
      console.error("Error disconnecting from Kafka", error);
    }
  }

  async produce(topic: string, message: any, key: string) {
    // Silently skip if Kafka is not configured or not connected
    if (!this.isConnected || !this.producer) {
      console.log(`📝 Event logged (Kafka disabled): ${topic}/${key}`);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(message) }],
      });
      console.log("✅ Message produced to Kafka", message);
    } catch (error) {
      // Non-critical - event was already handled by NestJS CQRS
      console.warn(
        "⚠️  Kafka produce failed (non-critical):",
        error instanceof Error ? error.message : error
      );
    }
  }

  async consume(topic: string, eachMessage: (message: any) => void) {
    if (!this.isConnected || !this.consumer) {
      console.warn("⚠️  Cannot consume - Kafka not connected");
      return;
    }

    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        // eslint-disable-next-line @typescript-eslint/require-await
        eachMessage: async ({ message }) => {
          if (message && message.value) {
            eachMessage(JSON.parse(message.value.toString()));
          } else {
            console.error("Invalid message format");
          }
        },
      });
    } catch (error) {
      console.error("Error consuming message from Kafka", error);
    }
  }
}
