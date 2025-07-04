import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Kafka, Producer, Consumer, Partitioners } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: (process.env.KAFKA_BROKERS || "").split(","),
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.consumer = this.kafka.consumer({ groupId: "my-group" });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      console.log("Kafka connected");
    } catch (error) {
      console.error("Error connecting to Kafka", error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      console.log("Kafka disconnected");
    } catch (error) {
      console.error("Error disconnecting from Kafka", error);
    }
  }

  async produce(topic: string, message: any, key: string) {
    try {
      await this.producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(message) }],
      });
      console.log("Message produced to Kafka", message);
    } catch (error) {
      console.error("Error producing message to Kafka", error);
    }
  }

  async consume(topic: string, eachMessage: (message: any) => void) {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
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
