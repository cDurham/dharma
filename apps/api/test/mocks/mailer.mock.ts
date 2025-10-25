export interface MockMailerService {
  sendMail: jest.Mock;
}

export const createMockMailerService = (): MockMailerService => ({
  sendMail: jest.fn(),
});
