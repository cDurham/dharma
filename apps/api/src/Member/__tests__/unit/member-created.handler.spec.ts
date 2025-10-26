import { Test, TestingModule } from "@nestjs/testing";
import { MemberCreatedHandler } from "../../events/member-created.handler";
import { MemberCreatedEvent } from "../../events/member-created.event";
import { KafkaService } from "../../../kafka/kafka.service";
import { createMockKafkaService, MockKafkaService } from "@test/mocks";

describe("MemberCreatedHandler", () => {
  let handler: MemberCreatedHandler;
  let kafkaServiceMock: MockKafkaService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    kafkaServiceMock = createMockKafkaService();

    moduleRef = await Test.createTestingModule({
      providers: [
        MemberCreatedHandler,
        {
          provide: KafkaService,
          useValue: kafkaServiceMock,
        },
      ],
    }).compile();

    handler = moduleRef.get(MemberCreatedHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should publish event to Kafka with correct payload", async () => {
    const event = new MemberCreatedEvent("member-123", "John");

    await handler.handle(event);

    expect(kafkaServiceMock.produce).toHaveBeenCalledWith(
      "members",
      {
        memberUuid: "member-123",
        firstName: "John",
      },
      "member-created"
    );
  });
});
