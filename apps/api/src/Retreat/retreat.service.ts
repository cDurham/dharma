import { Inject, Injectable } from "@nestjs/common";
import type { z } from "zod";
import { CrudService } from "../Domain/crud.service.js";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { retreat } from "../db/schema/index.js";
import type { RetreatRow } from "../db/types.js";
import { CreateRetreatSchema, UpdateRetreatSchema } from "./retreat.schema.js";

@Injectable()
export class RetreatService extends CrudService<
  RetreatRow,
  z.input<typeof CreateRetreatSchema>,
  z.input<typeof UpdateRetreatSchema>
> {
  protected readonly entityName = "Retreat";
  protected readonly table = retreat;
  protected readonly createSchema = CreateRetreatSchema;
  protected readonly updateSchema = UpdateRetreatSchema;

  constructor(
    @Inject(DB_TOKEN)
    db: typeof DbType,
  ) {
    super(db);
  }
}
