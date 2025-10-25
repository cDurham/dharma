export interface MockEventBus {
  publish: jest.Mock;
  publishAll: jest.Mock;
}

export const createMockEventBus = (): MockEventBus => ({
  publish: jest.fn(),
  publishAll: jest.fn(),
});
