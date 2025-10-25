import { Member } from "../../src/Member/member.entity";

export const createMemberFixture = (
  overrides: Partial<Member> = {}
): Member => {
  const now = new Date("2024-01-01T00:00:00.000Z");

  return {
    uuid: "member-uuid-123",
    firstName: "John",
    lastName: "Doe",
    joinDate: now,
    createdAt: now,
    updatedAt: now,
    user: null,
    ...overrides,
  };
};
