import { createMockDb, MockDb } from "../mocks/database.mock";

export interface TestDatabase {
  db: MockDb;
  clean: () => Promise<void>;
  stop: () => Promise<void>;
}

export const setupTestDatabase = async (): Promise<TestDatabase> => {
  const db = createMockDb();

  const resetDbMocks = () => {
    db.insert.mockReset();
    db.select.mockReset();
    db.update.mockReset();
    db.delete?.mockReset();
    db.__insert.values.mockReset();
    db.__select.from.mockReset();
    db.__select.where.mockReset();
    db.__update.set.mockReset();
    db.__update.where.mockReset();
    db.__delete.where.mockReset();
  };

  resetDbMocks();

  return {
    db,
    clean: async () => {
      resetDbMocks();
    },
    stop: async () => {
      resetDbMocks();
    },
  };
};
