import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { member } from "../db/schema/index.js";
import type { MemberRow } from "../db/types.js";
import type { CreateMemberInput, UpdateMemberInput } from "./member.input.js";
import type { UpdateMemberData } from "./member.schema.js";

@Injectable()
export class MemberService {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async list(): Promise<MemberRow[]> {
    return this.db.select().from(member);
  }

  async get(uuid: string): Promise<MemberRow | null> {
    const [row] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, uuid));
    return row ?? null;
  }

  async create(input: CreateMemberInput): Promise<MemberRow> {
    const uuid = uuidv7();
    await this.db.insert(member).values({
      uuid,
      firstName: input.firstName,
      lastName: input.lastName,
      joinDate: new Date(),
    });
    const [row] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, uuid));
    return row;
  }

  async update(uuid: string, data: UpdateMemberInput): Promise<MemberRow> {
    const existing = await this.get(uuid);
    if (!existing) {
      throw new Error("Member not found");
    }
    const updateData: UpdateMemberData = data;
    await this.db
      .update(member)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(member.uuid, uuid));
    const [row] = await this.db
      .select()
      .from(member)
      .where(eq(member.uuid, uuid));
    return row;
  }

  async remove(uuid: string): Promise<MemberRow> {
    const existing = await this.get(uuid);
    if (!existing) {
      throw new Error("Member not found");
    }
    await this.db.delete(member).where(eq(member.uuid, uuid));
    return existing;
  }
}
