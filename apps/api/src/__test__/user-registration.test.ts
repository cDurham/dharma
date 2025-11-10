import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { EmailService } from "../Email";
import { faker } from "@faker-js/faker";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

interface CreateUserResponse {
  createUser: {
    email: string;
    verificationToken: string;
  };
}

describe("User Registration and Email Verification", () => {
  let app: INestApplication;
  let sendVerificationEmailMock: jest.SpyInstance;

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

    const emailService = moduleFixture.get<EmailService>(EmailService);
    sendVerificationEmailMock = jest.spyOn(
      emailService,
      "sendVerificationEmail"
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it("should register a new user and send a verification email", async () => {
    const createUserMutation = `
        mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
                email
                verificationToken
            }
        }
    `;

    const variables = {
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    };

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createUserMutation, variables });

    expect(response.status).toBe(200);

    const body = response.body as GraphQLResponse<CreateUserResponse>;
    expect(body.data.createUser.email).toBe(variables.data.email);
    expect(body.data.createUser.verificationToken).toBeDefined();

    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      variables.data.email,
      body.data.createUser.verificationToken
    );
  });
});
