import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { MemberResolver } from "../../member.resolver";
import { CreateMemberCommand } from "../../commands/create-member.command";
import { UpdateMemberCommand } from "../../commands/update-member.command";
import { DeleteMemberCommand } from "../../commands/delete-member.command";
import { GetMembersQuery } from "../../commands/get-members.query";
import { GetMemberQuery } from "../../commands/get-member.query";
import { createMemberFixture } from "../../../../test/fixtures/member.fixture";
import { createMockCommandBus, MockCommandBus } from "../../../../test/mocks/command-bus.mock";
import { createMockQueryBus, MockQueryBus } from "../../../../test/mocks/query-bus.mock";

describe("MemberResolver", () => {
  let resolver: MemberResolver;
  let moduleRef: TestingModule;
  let mockCommandBus: MockCommandBus;
  let mockQueryBus: MockQueryBus;

  beforeEach(async () => {
    mockCommandBus = createMockCommandBus();
    mockQueryBus = createMockQueryBus();

    moduleRef = await Test.createTestingModule({
      providers: [
        MemberResolver,
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    resolver = moduleRef.get(MemberResolver);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should execute CreateMemberCommand when creating a member", async () => {
    const input = { firstName: "John", lastName: "Doe" };
    const createdMember = createMemberFixture();
    mockCommandBus.execute.mockResolvedValueOnce(createdMember);

    const result = await resolver.createMember(input);

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateMemberCommand)
    );
    const command = mockCommandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(CreateMemberCommand);
    expect(command.input).toEqual(input);
    expect(result).toEqual(createdMember);
  });

  it("should execute UpdateMemberCommand when updating a member", async () => {
    const updatedMember = createMemberFixture({ firstName: "Updated" });
    mockCommandBus.execute.mockResolvedValueOnce(updatedMember);

    const result = await resolver.updateMember("member-uuid", { firstName: "Updated" });

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.any(UpdateMemberCommand)
    );
    const command = mockCommandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(UpdateMemberCommand);
    expect(command.memberUuid).toBe("member-uuid");
    expect(command.data).toEqual({ firstName: "Updated" });
    expect(result).toEqual(updatedMember);
  });

  it("should execute DeleteMemberCommand when deleting a member", async () => {
    const deletedMember = createMemberFixture();
    mockCommandBus.execute.mockResolvedValueOnce(deletedMember);

    const result = await resolver.deleteMember("member-uuid");

    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.any(DeleteMemberCommand)
    );
    const command = mockCommandBus.execute.mock.calls[0][0];
    expect(command).toBeInstanceOf(DeleteMemberCommand);
    expect(command.memberUuid).toBe("member-uuid");
    expect(result).toEqual(deletedMember);
  });

  it("should query for all members", async () => {
    const members = [createMemberFixture()];
    mockQueryBus.execute.mockResolvedValueOnce(members);

    const result = await resolver.members();

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.any(GetMembersQuery)
    );
    expect(result).toEqual(members);
  });

  it("should query for a single member by uuid", async () => {
    const memberFixture = createMemberFixture();
    mockQueryBus.execute.mockResolvedValueOnce(memberFixture);

    const result = await resolver.member(memberFixture.uuid);

    expect(mockQueryBus.execute).toHaveBeenCalledWith(
      expect.any(GetMemberQuery)
    );
    const query = mockQueryBus.execute.mock.calls[0][0];
    expect(query).toBeInstanceOf(GetMemberQuery);
    expect(query.memberUuid).toBe(memberFixture.uuid);
    expect(result).toEqual(memberFixture);
  });
});
