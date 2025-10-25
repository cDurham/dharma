export interface MockCommandBus {
  execute: jest.Mock;
}

export const createMockCommandBus = (): MockCommandBus => ({
  execute: jest.fn(),
});
