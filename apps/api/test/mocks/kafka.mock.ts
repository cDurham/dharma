export interface MockKafkaProducer {
  connect: jest.Mock;
  disconnect: jest.Mock;
  send: jest.Mock;
}

export interface MockKafkaConsumer {
  connect: jest.Mock;
  disconnect: jest.Mock;
  subscribe: jest.Mock;
  run: jest.Mock;
}

export interface MockKafkaClient {
  producer: MockKafkaProducer;
  consumer: MockKafkaConsumer;
}

export interface MockKafkaService {
  produce: jest.Mock;
  consume: jest.Mock;
  onModuleInit: jest.Mock;
  onModuleDestroy: jest.Mock;
  __client: MockKafkaClient;
}

export const createMockKafkaClient = (): MockKafkaClient => ({
  producer: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
  },
  consumer: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    run: jest.fn(),
  },
});

export const createMockKafkaService = (): MockKafkaService => ({
  produce: jest.fn(),
  consume: jest.fn(),
  onModuleInit: jest.fn(),
  onModuleDestroy: jest.fn(),
  __client: createMockKafkaClient(),
});
