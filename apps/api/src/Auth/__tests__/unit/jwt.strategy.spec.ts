import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { QueryBus } from "@nestjs/cqrs";
import { UnauthorizedException } from "@nestjs/common";
import { JwtStrategy } from "../../jwt.strategy";
import { createMockConfigService, MockConfigService } from "../../../../test/mocks/config.mock";
import { createMockQueryBus, MockQueryBus } from "../../../../test/mocks/query-bus.mock";
import { createUserFixture } from "../../../../test/fixtures/user.fixture";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let moduleRef: TestingModule;
  let mockConfigService: MockConfigService;
  let mockQueryBus: MockQueryBus;

  beforeEach(async () => {
    mockConfigService = createMockConfigService();
    mockQueryBus = createMockQueryBus();
    mockConfigService.get.mockReturnValue("jwt-secret");

    moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    strategy = moduleRef.get(JwtStrategy);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should return sanitized user when validate succeeds", async () => {
    const user = createUserFixture();
    mockQueryBus.execute.mockResolvedValueOnce(user);

    const result = await strategy.validate({ sub: user.uuid, email: user.email });

    expect(mockQueryBus.execute).toHaveBeenCalled();
    expect(result).toEqual({
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      verificationToken: user.verificationToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });

  it("should throw UnauthorizedException when user not found", async () => {
    mockQueryBus.execute.mockResolvedValueOnce(null);

    await expect(
      strategy.validate({ sub: "missing-user", email: "missing@example.com" })
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should request user by uuid from payload", async () => {
    const user = createUserFixture();
    mockQueryBus.execute.mockResolvedValueOnce(user);

    await strategy.validate({ sub: user.uuid, email: user.email });

    const executedQuery = mockQueryBus.execute.mock.calls[0]?.[0];
    expect(executedQuery).toBeDefined();
    expect(executedQuery).toHaveProperty("userUuid", user.uuid);
  });
});
