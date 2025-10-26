import { KafkaService } from "../../kafka.service";

jest.mock("kafkajs", () => {
  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
      }),
      consumer: jest.fn().mockReturnValue({
        connect: jest.fn(),
        disconnect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
      }),
    })),
    Partitioners: {
      LegacyPartitioner: Symbol("LegacyPartitioner"),
    },
  };
});

describe("KafkaService", () => {
  let service: KafkaService;
  let mockProducerInstance: any;
  let mockConsumerInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KafkaService();
    // Access the mocked instances through the service
    mockProducerInstance = (service as any).producer;
    mockConsumerInstance = (service as any).consumer;
  });

  it("should connect producer and consumer on module init", async () => {
    await service.onModuleInit();

    expect(mockProducerInstance.connect).toHaveBeenCalledTimes(1);
    expect(mockConsumerInstance.connect).toHaveBeenCalledTimes(1);
  });

  it("should disconnect producer and consumer on module destroy", async () => {
    await service.onModuleDestroy();

    expect(mockProducerInstance.disconnect).toHaveBeenCalledTimes(1);
    expect(mockConsumerInstance.disconnect).toHaveBeenCalledTimes(1);
  });

  it("should send messages via producer", async () => {
    await service.produce("topic", { id: 1 }, "key");

    expect(mockProducerInstance.send).toHaveBeenCalledWith({
      topic: "topic",
      messages: [{ key: "key", value: JSON.stringify({ id: 1 }) }],
    });
  });

  it("should subscribe and run consumer when consuming messages", async () => {
    await service.consume("topic", jest.fn());

    expect(mockConsumerInstance.subscribe).toHaveBeenCalledWith({
      topic: "topic",
      fromBeginning: true,
    });
    expect(mockConsumerInstance.run).toHaveBeenCalledTimes(1);
  });
});
