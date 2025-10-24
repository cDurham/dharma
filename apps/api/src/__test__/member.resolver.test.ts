import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { Member } from "../Member/member.entity";
import { faker } from "@faker-js/faker";
import { Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

describe("E2E - Member Resolver", () => {
  let app: INestApplication;
  let memberRepository: Repository<Member>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    memberRepository = moduleFixture.get<Repository<Member>>(
      getRepositoryToken(Member)
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const createMember = async () => {
    const createMemberMutation = `mutation createMember($data: CreateMemberInput!) {
        createMember(data: $data) {
            uuid
            first_name
            last_name
        }
    }`;

    const variables = {
      data: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      },
    };

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({ query: createMemberMutation, variables })
      .expect(200);

    return response.body.data.createMember;
  };

  afterAll(async () => {
    await app.close();
  });

  it("/create member", async () => {
    const member = await createMember();
    expect(member).toHaveProperty("uuid");
    expect(member).toHaveProperty("first_name");
    expect(member).toHaveProperty("last_name");
  });

  it("/get members", async () => {
    await createMember(); // Ensure at least one member exists

    const getMembersQuery = `query members {
        members {
          first_name
          last_name
          join_date
          uuid
        }
      }`;

    return request(app.getHttpServer())
      .post("/graphql/")
      .send({ query: getMembersQuery })
      .expect(200)
      .then((response) => {
        expect(response.body.data.members).toBeInstanceOf(Array);
        response.body.data.members.forEach((member: any) => {
          expect(typeof member.first_name).toBe("string");
          expect(typeof member.last_name).toBe("string");
          expect(typeof member.uuid).toBe("string");
          expect(typeof member.join_date).toBe("string");
        });
      });
  });

  it("updates member", async () => {
    const createdMember = await createMember();

    const updateMemberMutation = `mutation updateMember($id: String!, $data: UpdateMemberInput!) {
        updateMember(id: $id, data: $data) {
            first_name
            last_name
        }
    }`;

    const variables = {
      id: createdMember.uuid,
      data: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      },
    };

    return request(app.getHttpServer())
      .post("/graphql")
      .send({ query: updateMemberMutation, variables })
      .expect(200)
      .then((response) => {
        console.log(response.body);
        expect(response.body.data.updateMember).toEqual(variables.data);
      });
  });

  it("delete member", async () => {
    const createdMember = await createMember();

    const deleteMemberMutation = `mutation deleteMember($id: String!) {
        deleteMember(id: $id)
      }`;
    const variables = {
      id: createdMember.uuid,
    };

    return request(app.getHttpServer())
      .post("/graphql")
      .send({ query: deleteMemberMutation, variables })
      .expect(200)
      .then((response) => {
        expect(response.body.data.deleteMember).toBe(true);
      });
  });
});
