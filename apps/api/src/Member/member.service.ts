import { Inject, Injectable } from "@nestjs/common";
import type { z } from "zod";
import { CrudService } from "../Domain/crud.service.js";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { member } from "../db/schema/index.js";
import type { MemberRow } from "../db/types.js";
import { CreateMemberSchema, UpdateMemberSchema } from "./member.schema.js";

@Injectable()
export class MemberService extends CrudService<
  MemberRow,
  z.input<typeof CreateMemberSchema>,
  z.input<typeof UpdateMemberSchema>
> {
  protected readonly entityName = "Member";
  protected readonly table = member;
  protected readonly createSchema = CreateMemberSchema;
  protected readonly updateSchema = UpdateMemberSchema;

  constructor(
    @Inject(DB_TOKEN)
    db: typeof DbType,
  ) {
    super(db);
  }
}
