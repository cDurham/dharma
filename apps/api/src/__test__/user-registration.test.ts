import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../app.module";
import { EmailService } from "../Email";
import { faker } from "@faker-js/faker";
import { createGraphQLClient, GraphQLClient } from "./graphql-client";

describe("User Registration and Email Verification", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;
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
    graphql = createGraphQLClient(app);

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

    const response = await graphql.mutation<
      { createUser: { email: string; verificationToken: string } },
      typeof variables
    >({
      query: createUserMutation,
      variables,
    });

    graphql.expectOk(response);
    const { createUser } = response.data;
    expect(createUser.email).toBe(variables.data.email);
    expect(createUser.verificationToken).toBeDefined();

    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      variables.data.email,
      createUser.verificationToken
    );
  });
});
