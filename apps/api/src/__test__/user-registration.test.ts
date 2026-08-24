import { faker } from "@faker-js/faker";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { vi } from "vitest";
import { AppModule } from "../app.module.js";
import { EmailService } from "../Email/index.js";
import { createGraphQLClient, type GraphQLClient } from "./graphql-client.js";

describe("User Registration and Email Verification", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;
  const sendVerificationEmailMock = vi.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendVerificationEmail: sendVerificationEmailMock,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    graphql = createGraphQLClient(app);
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
      createUser.verificationToken,
    );
  });
});
