import { faker } from "@faker-js/faker";
import type { INestApplication } from "@nestjs/common";
import { vi } from "vitest";
import { EmailService } from "../Email/index.js";
import { createTestApp } from "./create-test-app.js";
import { createGraphQLClient, type GraphQLClient } from "./graphql-client.js";

describe("User Registration and Email Verification", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;
  const sendVerificationEmailMock = vi.fn();

  beforeAll(async () => {
    app = await createTestApp((builder) =>
      builder.overrideProvider(EmailService).useValue({
        sendVerificationEmail: sendVerificationEmailMock,
      }),
    );
    graphql = createGraphQLClient(app);
  });

  afterAll(async () => {
    await app.close();
  });

  // Deliberately anonymous: registration is on the @Public allowlist, and
  // this test is the proof it stays reachable without a session.
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
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    };

    const response = await graphql.mutation<
      { createUser: { email: string } },
      typeof variables
    >({
      query: createUserMutation,
      variables,
    });

    graphql.expectOk(response);
    const { createUser } = response.data;
    expect(createUser.email).toBe(variables.data.email);

    // The token never crosses the GraphQL interface; the email send is
    // where it surfaces.
    expect(sendVerificationEmailMock).toHaveBeenCalledWith(
      variables.data.email,
      expect.any(String),
    );
  });
});
