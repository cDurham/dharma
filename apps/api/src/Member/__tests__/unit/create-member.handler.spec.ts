import { Test, TestingModule } from "@nestjs/testing";
import { EventBus } from "@nestjs/cqrs";
import { DB_TOKEN } from "../../../db/database.module";
import { MemberCreatedEvent } from "../../events/member-created.event";
import { CreateMemberCommand } from "../../commands/create-member.command";
import { CreateMemberHandler } from "../../commands/create-member.handler";
import { member } from "../../../db/schema";
import { createMockDb, MockDb } from "../../../../test/mocks/database.mock";
import { createMockEventBus, MockEventBus } from "../../../../test/mocks/event-bus.mock";
import { createMemberFixture } from "../../../../test/fixtures/member.fixture";

jest.mock("uuid", () => ({
  v7: jest.fn(),
}));

const uuidModule = jest.requireMock("uuid");
const mockUuid: jest.Mock = uuidModule.v7;

describe("CreateMemberHandler", () => {
  let handler: CreateMemberHandler;
  let mockDb: MockDb;
  let mockEventBus: MockEventBus;
  let moduleRef: TestingModule;

  const now = new Date("2024-01-01T00:00:00.000Z");

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(now);
    mockDb = createMockDb();
    mockEventBus = createMockEventBus();

    moduleRef = await Test.createTestingModule({
      providers: [
        CreateMemberHandler,
        {
          provide: DB_TOKEN,
          useValue: mockDb,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    handler = moduleRef.get(CreateMemberHandler);
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should insert member into the database with generated uuid", async () => {
    const command = new CreateMemberCommand({
      firstName: "John",
      lastName: "Doe",
    });
    const expectedMember = createMemberFixture({
      uuid: "generated-uuid",
      joinDate: now,
    });

    mockUuid.mockReturnValueOnce("generated-uuid");
    mockDb.__insert.values.mockResolvedValueOnce(undefined);
    mockDb.__select.where.mockResolvedValueOnce([expectedMember]);

    const result = await handler.execute(command);

    expect(mockDb.insert).toHaveBeenCalledWith(member);
    expect(mockDb.__insert.values).toHaveBeenCalledWith({
      uuid: "generated-uuid",
      firstName: "John",
      lastName: "Doe",
      joinDate: now,
    });
    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.__select.where).toHaveBeenCalled();
    expect(result).toEqual(expectedMember);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.any(MemberCreatedEvent)
    );
  });

  it("should publish MemberCreatedEvent with saved member data", async () => {
    const savedMember = createMemberFixture({
      uuid: "generated-uuid",
      firstName: "Alice",
    });
    mockUuid.mockReturnValueOnce("generated-uuid");
    mockDb.__insert.values.mockResolvedValueOnce(undefined);
    mockDb.__select.where.mockResolvedValueOnce([savedMember]);

    await handler.execute(
      new CreateMemberCommand({
        firstName: savedMember.firstName,
        lastName: savedMember.lastName,
      })
    );

    expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
    expect(mockEventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        memberUuid: savedMember.uuid,
        firstName: savedMember.firstName,
      })
    );
  });

  it("should propagate database errors", async () => {
    mockUuid.mockReturnValueOnce("generated-uuid");
    mockDb.__insert.values.mockRejectedValueOnce(new Error("DB failure"));

    await expect(
      handler.execute(
        new CreateMemberCommand({
          firstName: "John",
          lastName: "Doe",
        })
      )
    ).rejects.toThrow("DB failure");
  });
});
