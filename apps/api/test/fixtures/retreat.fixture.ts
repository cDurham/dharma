import { Retreat } from "../../src/Retreat/retreat.entity";

export const createRetreatFixture = (
  overrides: Partial<Retreat> = {}
): Retreat => {
  const start = new Date("2024-02-01T09:00:00.000Z");
  const end = new Date("2024-02-05T18:00:00.000Z");

  return {
    uuid: "retreat-uuid-123",
    name: "Mindfulness Retreat",
    startAt: start,
    endAt: end,
    createdAt: start,
    updatedAt: start,
    ...overrides,
  };
};
