import { KafkaService } from "../../kafka.service";

const mockProducer = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn(),
};

const mockConsumer = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  subscribe: jest.fn(),
  run: jest.fn(),
};

const mockKafkaConstructor = jest.fn().mockImplementation(() => ({
  producer: jest.fn().mockReturnValue(mockProducer),
  consumer: jest.fn().mockReturnValue(mockConsumer),
}));

jest.mock("kafkajs", () => ({
  Kafka: mockKafkaConstructor,
  Partitioners: {
    LegacyPartitioner: Symbol("LegacyPartitioner"),
  },
}));

describe("KafkaService", () => {
  let service: KafkaService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new KafkaService();
  });

  it("should connect producer and consumer on module init", async () => {
    await service.onModuleInit();

    expect(mockProducer.connect).toHaveBeenCalledTimes(1);
    expect(mockConsumer.connect).toHaveBeenCalledTimes(1);
  });

  it("should disconnect producer and consumer on module destroy", async () => {
    await service.onModuleDestroy();

    expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);
    expect(mockConsumer.disconnect).toHaveBeenCalledTimes(1);
  });

  it("should send messages via producer", async () => {
    await service.produce("topic", { id: 1 }, "key");

    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: "topic",
      messages: [{ key: "key", value: JSON.stringify({ id: 1 }) }],
    });
  });

  it("should subscribe and run consumer when consuming messages", async () => {
    await service.consume("topic", jest.fn());

    expect(mockConsumer.subscribe).toHaveBeenCalledWith({
      topic: "topic",
      fromBeginning: true,
    });
    expect(mockConsumer.run).toHaveBeenCalledTimes(1);
  });
});
