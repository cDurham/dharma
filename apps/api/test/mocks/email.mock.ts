export interface MockEmailService {
  sendVerificationEmail: jest.Mock;
}

export const createMockEmailService = (): MockEmailService => ({
  sendVerificationEmail: jest.fn(),
});
