export interface MockConfigService {
  get: jest.Mock;
}

export const createMockConfigService = (): MockConfigService => ({
  get: jest.fn(),
});
