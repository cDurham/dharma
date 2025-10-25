import { User } from "../../src/User/user.entity";

export const createUserFixture = (overrides: Partial<User> = {}): User => {
  const now = new Date("2024-01-01T00:00:00.000Z");

  return {
    uuid: "user-uuid-123",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    password: "hashed-password",
    verificationToken: "verification-token",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};
