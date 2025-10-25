export interface MockQueryBus {
  execute: jest.Mock;
}

export const createMockQueryBus = (): MockQueryBus => ({
  execute: jest.fn(),
});
