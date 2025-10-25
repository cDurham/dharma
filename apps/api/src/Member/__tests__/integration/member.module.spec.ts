import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus, CqrsModule, QueryBus } from "@nestjs/cqrs";
import { MemberModule } from "../../member.module";
import { DB_TOKEN } from "../../../db/database.module";
import { member } from "../../../db/schema";
import { CreateMemberCommand } from "../../commands/create-member.command";
import { GetMemberQuery } from "../../commands/get-member.query";
import { createMockDb, MockDb } from "../../../../../test/mocks/database.mock";
import { createMockKafkaService, MockKafkaService } from "../../../../../test/mocks/kafka.mock";
import { KafkaService } from "../../../kafka/kafka.service";
import { createMemberFixture } from "../../../../../test/fixtures/member.fixture";

jest.mock("uuid", () => ({
  v7: jest.fn(),
}));

const uuidModule = jest.requireMock("uuid");
const mockUuid: jest.Mock = uuidModule.v7;

describe("MemberModule Integration", () => {
  let moduleRef: TestingModule;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let mockDb: MockDb;
  let mockKafkaService: MockKafkaService;

  beforeEach(async () => {
    mockDb = createMockDb();
    mockKafkaService = createMockKafkaService();

    moduleRef = await Test.createTestingModule({
      imports: [CqrsModule, MemberModule],
      providers: [
        {
          provide: DB_TOKEN,
          useValue: mockDb,
        },
      ],
    })
      .overrideProvider(KafkaService)
      .useValue(mockKafkaService)
      .compile();

    await moduleRef.init();
    commandBus = moduleRef.get(CommandBus);
    queryBus = moduleRef.get(QueryBus);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should create a member and publish MemberCreatedEvent", async () => {
    const createdMember = createMemberFixture({
      uuid: "generated-member",
    });
    mockUuid.mockReturnValueOnce(createdMember.uuid);
    mockDb.__insert.values.mockResolvedValueOnce(undefined);
    mockDb.__select.where.mockResolvedValueOnce([createdMember]);

    const result = await commandBus.execute(
      new CreateMemberCommand({
        firstName: createdMember.firstName,
        lastName: createdMember.lastName,
      })
    );

    await new Promise((resolve) => setImmediate(resolve));

    expect(mockDb.insert).toHaveBeenCalledWith(member);
    expect(result).toEqual(createdMember);
    expect(mockKafkaService.produce).toHaveBeenCalledWith(
      "members",
      {
        memberUuid: createdMember.uuid,
        firstName: createdMember.firstName,
      },
      "member-created"
    );
  });

  it("should fetch member details via QueryBus", async () => {
    const memberFixture = createMemberFixture();
    mockDb.__select.where.mockResolvedValueOnce([memberFixture]);

    const result = await queryBus.execute(
      new GetMemberQuery(memberFixture.uuid)
    );

    expect(mockDb.select).toHaveBeenCalled();
    expect(result).toEqual(memberFixture);
  });
});
