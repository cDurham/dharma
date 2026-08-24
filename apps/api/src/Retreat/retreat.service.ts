import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { retreat } from "../db/schema/index.js";
import type { RetreatRow } from "../db/types.js";
import type {
  CreateRetreatInput,
  UpdateRetreatInput,
} from "./retreat.input.js";
import { UpdateRetreatSchema } from "./retreat.schema.js";

@Injectable()
export class RetreatService {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
  ) {}

  async list(): Promise<RetreatRow[]> {
    return this.db.select().from(retreat);
  }

  async get(uuid: string): Promise<RetreatRow | null> {
    const [row] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, uuid));
    return row ?? null;
  }

  async create(input: CreateRetreatInput): Promise<RetreatRow> {
    const uuid = uuidv7();
    await this.db.insert(retreat).values({
      uuid,
      name: input.name,
      startAt: input.startAt,
      endAt: input.endAt,
    });
    const [row] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, uuid));
    return row;
  }

  async update(uuid: string, data: UpdateRetreatInput): Promise<RetreatRow> {
    const existing = await this.get(uuid);
    if (!existing) {
      throw new Error("Retreat not found");
    }
    const updateData = UpdateRetreatSchema.parse(data);
    await this.db
      .update(retreat)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(retreat.uuid, uuid));
    const [row] = await this.db
      .select()
      .from(retreat)
      .where(eq(retreat.uuid, uuid));
    return row;
  }

  async remove(uuid: string): Promise<boolean> {
    const existing = await this.get(uuid);
    if (!existing) {
      throw new Error("Retreat not found");
    }
    await this.db.delete(retreat).where(eq(retreat.uuid, uuid));
    return true;
  }
}
