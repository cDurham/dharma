import { faker } from "@faker-js/faker";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { AppModule } from "../app.module";
import { type GraphQLClient, createGraphQLClient } from "./graphql-client";

interface Member {
  uuid: string;
  firstName: string;
  lastName: string;
  joinDate?: string;
}

describe("E2E - Member Resolver", () => {
  let app: INestApplication;
  let graphql: GraphQLClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    graphql = createGraphQLClient(app);
  });

  afterAll(async () => {
    await app.close();
  });

  const createMember = async (): Promise<Member> => {
    const createMemberMutation = `mutation createMember($data: CreateMemberInput!) {
        createMember(data: $data) {
            uuid
            firstName
            lastName
        }
    }`;

    const variables = {
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    };

    const response = await graphql.mutation<
      { createMember: Member },
      typeof variables
    >({
      query: createMemberMutation,
      variables,
    });

    graphql.expectOk(response);
    return response.data.createMember;
  };

  it("/create member", async () => {
    const member = await createMember();
    expect(member).toHaveProperty("uuid");
    expect(member).toHaveProperty("firstName");
    expect(member).toHaveProperty("lastName");
  });

  it("/get members", async () => {
    await createMember(); // Ensure at least one member exists

    const getMembersQuery = `query members {
        members {
          uuid
          firstName
          lastName
          joinDate
        }
      }`;

    const response = await graphql.query<{ members: Member[] }>({
      query: getMembersQuery,
    });

    graphql.expectOk(response);
    const { members } = response.data;
    expect(members).toBeInstanceOf(Array);
    members.forEach((member) => {
      expect(typeof member.firstName).toBe("string");
      expect(typeof member.lastName).toBe("string");
      expect(typeof member.uuid).toBe("string");
      expect(typeof member.joinDate).toBe("string");
    });
  });

  it("updates member", async () => {
    const createdMember = await createMember();

    const updateMemberMutation = `mutation updateMember($uuid: String!, $data: UpdateMemberInput!) {
        updateMember(uuid: $uuid, data: $data) {
            firstName
            lastName
        }
    }`;

    const variables = {
      uuid: createdMember.uuid,
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    };

    const response = await graphql.mutation<
      { updateMember: Member },
      typeof variables
    >({
      query: updateMemberMutation,
      variables,
    });

    graphql.expectOk(response);
    expect(response.data.updateMember.firstName).toEqual(
      variables.data.firstName,
    );
    expect(response.data.updateMember.lastName).toEqual(
      variables.data.lastName,
    );
  });

  it("delete member", async () => {
    const createdMember = await createMember();

    const deleteMemberMutation = `mutation deleteMember($uuid: String!) {
        deleteMember(uuid: $uuid) {
          uuid
          firstName
          lastName
        }
      }`;
    const variables = {
      uuid: createdMember.uuid,
    };

    const response = await graphql.mutation<
      { deleteMember: Member },
      typeof variables
    >({
      query: deleteMemberMutation,
      variables,
    });

    graphql.expectOk(response);
    expect(response.data.deleteMember.uuid).toBe(createdMember.uuid);
  });
});
