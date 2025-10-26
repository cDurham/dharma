import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { TokenCleanupService } from "../../token-cleanup.service";
import { DB_TOKEN } from "../../../db/database.module";
import { refreshToken } from "../../../db/schema";
import { createMockDb, MockDb } from "@test/mocks";

describe("TokenCleanupService", () => {
  let service: TokenCleanupService;
  let moduleRef: TestingModule;
  let mockDb: MockDb;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  const now = new Date("2024-01-15T08:00:00.000Z");

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);
    logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    errorSpy = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation(() => undefined);

    mockDb = createMockDb();

    moduleRef = await Test.createTestingModule({
      providers: [
        TokenCleanupService,
        {
          provide: DB_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = moduleRef.get(TokenCleanupService);
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should delete expired or revoked tokens older than seven days", async () => {
    mockDb.__delete.where.mockResolvedValueOnce(undefined);

    await service.cleanupExpiredTokens();

    expect(mockDb.delete).toHaveBeenCalledWith(refreshToken);
    expect(mockDb.__delete.where).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith("Starting refresh token cleanup...");
    expect(logSpy).toHaveBeenCalledWith("Cleanup complete.");
  });

  it("should log errors from the database layer", async () => {
    mockDb.__delete.where.mockRejectedValueOnce(new Error("DB failure"));

    await service.cleanupExpiredTokens();

    expect(errorSpy).toHaveBeenCalledWith(
      "Error during token cleanup:",
      expect.any(Error)
    );
  });
});
