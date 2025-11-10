import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { faker } from "@faker-js/faker";

interface GraphQLResponse<T> {
  data: T;
}

interface Member {
  uuid: string;
  firstName: string;
  lastName: string;
  joinDate?: string;
}

describe("E2E - Member Resolver", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createMemberMutation, variables })
      .expect(200);

    const body = response.body as GraphQLResponse<{ createMember: Member }>;
    return body.data.createMember;
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

    const response = await request(app.getHttpServer())
      .post("/graphql/")
      .send({ query: getMembersQuery })
      .expect(200);

    const body = response.body as GraphQLResponse<{ members: Member[] }>;
    expect(body.data.members).toBeInstanceOf(Array);
    body.data.members.forEach((member) => {
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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: updateMemberMutation, variables })
      .expect(200);

    const body = response.body as GraphQLResponse<{ updateMember: Member }>;
    expect(body.data.updateMember.firstName).toEqual(variables.data.firstName);
    expect(body.data.updateMember.lastName).toEqual(variables.data.lastName);
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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: deleteMemberMutation, variables })
      .expect(200);

    const body = response.body as GraphQLResponse<{ deleteMember: Member }>;
    expect(body.data.deleteMember.uuid).toBe(createdMember.uuid);
  });
});
