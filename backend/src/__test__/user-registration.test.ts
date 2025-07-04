import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { EmailService } from "../Email";
import { faker } from "@faker-js/faker";

describe("User Registration and Email Verification", () => {
  let app: INestApplication;
  let emailService: EmailService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendVerificationEmail: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    emailService = moduleFixture.get<EmailService>(EmailService);
  });

  it("should register a new user and send a verification email", async () => {
    const createUserMutation = `
        mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
                email
            }
        }
    `;

    const variables = {
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      },
    };

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createUserMutation, variables });

    expect(response.status).toBe(200);
    expect(response.body.data.createUser.email).toBe(variables.data.email);
    expect(response.body.data.createUser.verificationToken).toBeDefined();

    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      variables.data.email,
      response.body.data.createUser.verificationToken
    );
  });
});
