import { faker } from "@faker-js/faker";
import type { INestApplication } from "@nestjs/common";
import { signUpAndLogin, type TestUser } from "./auth-helper.js";
import { createTestApp } from "./create-test-app.js";
import { createGraphQLClient, type GraphQLClient } from "./graphql-client.js";

/** The CRUD contract the three domains share, exercised over GraphQL. */
const MISSING_UUID = "00000000-0000-0000-0000-000000000000";

describe("E2E - domain CRUD contract", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;
  let user: TestUser;

  beforeAll(async () => {
    app = await createTestApp();
    graphql = createGraphQLClient(app);
    user = await signUpAndLogin(graphql);
  });

  afterAll(async () => {
    await app.close();
  });

  const createMember = async (): Promise<string> => {
    const response = await graphql.mutation<{ createMember: { uuid: string } }>(
      {
        query: `mutation createMember($data: CreateMemberInput!) {
            createMember(data: $data) { uuid }
        }`,
        variables: {
          data: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          },
        },
      },
    );
    graphql.expectOk(response);
    return response.data.createMember.uuid;
  };

  it("updateUser persists every field UpdateUserInput accepts", async () => {
    const names = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    };

    const response = await graphql.mutation<{
      updateUser: { firstName: string; lastName: string };
    }>({
      query: `mutation updateUser($uuid: String!, $data: UpdateUserInput!) {
          updateUser(uuid: $uuid, data: $data) { firstName lastName }
      }`,
      variables: { uuid: user.uuid, data: names },
    });

    graphql.expectOk(response);
    expect(response.data.updateUser).toEqual(names);

    // The mutation's own response does not prove the write; re-read the row.
    const reread = await graphql.query<{
      me: { firstName: string; lastName: string };
    }>({ query: `query me { me { firstName lastName } }` });

    graphql.expectOk(reread);
    expect(reread.data.me).toEqual(names);
  });

  it("an update with no fields is a read, not an error", async () => {
    const uuid = await createMember();

    const response = await graphql.mutation<{
      updateMember: { uuid: string; firstName: string };
    }>({
      query: `mutation updateMember($uuid: String!, $data: UpdateMemberInput!) {
          updateMember(uuid: $uuid, data: $data) { uuid firstName }
      }`,
      variables: { uuid, data: {} },
    });

    graphql.expectOk(response);
    expect(response.data.updateMember.uuid).toBe(uuid);
  });

  it.each([
    ["user", `query user($uuid: String!) { user(uuid: $uuid) { uuid } }`],
    ["member", `query member($uuid: String!) { member(uuid: $uuid) { uuid } }`],
    [
      "retreat",
      `query retreat($uuid: String!) { retreat(uuid: $uuid) { uuid } }`,
    ],
  ])("a %s that does not exist is null, not a crash", async (field, query) => {
    const response = await graphql.query<Record<string, unknown>>({
      query,
      variables: { uuid: MISSING_UUID },
    });

    graphql.expectOk(response);
    expect(response.data[field]).toBeNull();
  });

  // updateUser is absent: its ownership check answers FORBIDDEN before the row
  // is looked up. deleteUser has no ownership check.
  it.each([
    [
      "updateMember",
      `mutation updateMember($uuid: String!) {
          updateMember(uuid: $uuid, data: { firstName: "Ghost" }) { uuid }
      }`,
    ],
    [
      "updateRetreat",
      `mutation updateRetreat($uuid: String!) {
          updateRetreat(uuid: $uuid, data: { name: "Ghost" }) { uuid }
      }`,
    ],
    ["deleteUser", `mutation d($uuid: String!) { deleteUser(uuid: $uuid) }`],
    [
      "deleteMember",
      `mutation d($uuid: String!) { deleteMember(uuid: $uuid) }`,
    ],
    [
      "deleteRetreat",
      `mutation d($uuid: String!) { deleteRetreat(uuid: $uuid) }`,
    ],
  ])("%s against a missing row answers NOT_FOUND", async (_name, query) => {
    const response = await graphql.mutation({
      query,
      variables: { uuid: MISSING_UUID },
    });

    expect(response.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");
  });
});
