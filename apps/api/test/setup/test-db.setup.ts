import { createMockDb, MockDb } from "../mocks/database.mock";

// Set up required environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_DATABASE = 'dharma_db';
process.env.KAFKA_CLIENT_ID = 'test-kafka-client';
process.env.KAFKA_BROKERS = 'localhost:9092';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_USER_PASSWORD = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

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
