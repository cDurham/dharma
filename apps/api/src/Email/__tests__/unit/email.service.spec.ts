import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailService } from "../../email.service";
import { createMockMailerService, MockMailerService } from "../../../../test/mocks/mailer.mock";
import { createMockConfigService, MockConfigService } from "../../../../test/mocks/config.mock";

describe("EmailService", () => {
  let service: EmailService;
  let moduleRef: TestingModule;
  let mockMailerService: MockMailerService;
  let mockConfigService: MockConfigService;

  beforeEach(async () => {
    mockMailerService = createMockMailerService();
    mockConfigService = createMockConfigService();
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === "BACKEND_URL") {
        return "http://localhost:4000";
      }
      if (key === "EMAIL_USER") {
        return "noreply@example.com";
      }
      return undefined;
    });

    moduleRef = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = moduleRef.get(EmailService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it("should send verification email with correct parameters", async () => {
    await service.sendVerificationEmail("user@example.com", "token-123");

    expect(mockMailerService.sendMail).toHaveBeenCalledTimes(1);
    const [message] = mockMailerService.sendMail.mock.calls[0];

    expect(message).toMatchObject({
      from: "noreply@example.com",
      to: "user@example.com",
      subject: "Verify your email",
    });
    expect(message.html).toContain("http://localhost:4000/verify?token=token-123");
  });

  it("should propagate mailer errors", async () => {
    mockMailerService.sendMail.mockRejectedValueOnce(new Error("SMTP down"));

    await expect(
      service.sendVerificationEmail("user@example.com", "token-123")
    ).rejects.toThrow("SMTP down");
  });
});
