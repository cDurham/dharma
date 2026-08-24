import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { expect } from "vitest";
import { db } from "../db/data-source.js";
import { user } from "../db/schema/index.js";
import type { GraphQLClient, GraphQLResponse } from "./graphql-client.js";

export interface TestUser {
  uuid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function signUpAndLogin(client: GraphQLClient): Promise<TestUser> {
  const credentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  const created = await client.mutation<
    { createUser: { uuid: string } },
    { data: typeof credentials }
  >({
    query: `mutation CreateUser($data: CreateUserInput!) {
        createUser(data: $data) {
            uuid
        }
    }`,
    variables: { data: credentials },
  });
  client.expectOk(created);

  // Login refuses unverified users; verified means verification_token IS NULL.
  await db
    .update(user)
    .set({ verificationToken: null })
    .where(eq(user.email, credentials.email));

  const loggedIn = await client.mutation<
    { login: { message: string } },
    { data: { email: string; password: string } }
  >({
    query: `mutation Login($data: ValidateUserInput!) {
        login(data: $data) {
            message
        }
    }`,
    variables: {
      data: { email: credentials.email, password: credentials.password },
    },
  });
  client.expectOk(loggedIn);

  return { uuid: created.data.createUser.uuid, ...credentials };
}

export function expectUnauthenticated(
  response: GraphQLResponse<unknown>,
): void {
  expect(response.data ?? null).toBeNull();
  expect(response.errors?.[0]?.message).toBe("Unauthorized");
  expect(response.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
}
