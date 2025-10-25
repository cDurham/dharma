import { Test, TestingModule } from "@nestjs/testing";
import { DB_TOKEN } from "../../../db/database.module";
import { GetMemberQuery } from "../../commands/get-member.query";
import { GetMemberHandler } from "../../commands/get-member.handler";
import { createMockDb, MockDb } from "../../../../test/mocks/database.mock";
import { createMemberFixture } from "../../../../test/fixtures/member.fixture";

describe("GetMemberHandler", () => {
  let handler: GetMemberHandler;
  let mockDb: MockDb;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    mockDb = createMockDb();
    moduleRef = await Test.createTestingModule({
      providers: [
        GetMemberHandler,
        {
          provide: DB_TOKEN,
          useValue: mockDb,
        },
      ],
    }).compile();

    handler = moduleRef.get(GetMemberHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should return a member when found", async () => {
    const expected = createMemberFixture();
    mockDb.__select.where.mockResolvedValueOnce([expected]);

    const result = await handler.execute(new GetMemberQuery(expected.uuid));

    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.__select.from).toHaveBeenCalled();
    expect(mockDb.__select.where).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it("should return null when no member is found", async () => {
    mockDb.__select.where.mockResolvedValueOnce([]);

    const result = await handler.execute(new GetMemberQuery("missing"));

    expect(result).toBeNull();
  });

  it("should propagate database errors", async () => {
    mockDb.__select.where.mockRejectedValueOnce(new Error("DB error"));

    await expect(
      handler.execute(new GetMemberQuery("member-uuid"))
    ).rejects.toThrow("DB error");
  });
});
