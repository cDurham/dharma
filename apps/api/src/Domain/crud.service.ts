import { NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import type { ZodType } from "zod";
import type { db as DbType } from "../db/data-source.js";

/** A table with a uuid primary key, which `baseColumns` gives every domain table. */
export type DomainTable = PgTable & { uuid: PgColumn };

/**
 * Base class for the domain services. It holds the only write path to a domain
 * table, and enforces on it:
 *
 *   - a missing row raises NotFoundException
 *   - every write takes one round-trip, through `returning()`
 *   - `updatedAt` is left to `baseColumns.$onUpdate`
 *   - input passes the subclass's zod schema before it reaches the table
 *
 * Drizzle's query builders lose their row types once the table arrives as a
 * type parameter; the casts restore them from `TRow`.
 *
 * ADR 0001 places `db.transaction()` and audit emission in these five methods.
 */
export abstract class CrudService<
  TRow extends { uuid: string },
  TCreate,
  TUpdate,
> {
  /** Appears in not-found messages: "Member not found: <uuid>". */
  protected abstract readonly entityName: string;
  protected abstract readonly table: DomainTable;
  protected abstract readonly createSchema: ZodType;
  protected abstract readonly updateSchema: ZodType;

  protected constructor(protected readonly db: typeof DbType) {}

  async list(): Promise<TRow[]> {
    return (await this.db.select().from(this.table)) as TRow[];
  }

  async get(uuid: string): Promise<TRow | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.uuid, uuid));
    return (row as TRow | undefined) ?? null;
  }

  async create(input: TCreate): Promise<TRow> {
    const values = this.createSchema.parse(input) as Record<string, unknown>;
    // uuidv7 keeps primary keys time-ordered.
    const [row] = await this.db
      .insert(this.table)
      .values({ uuid: uuidv7(), ...values } as never)
      .returning();
    return row as TRow;
  }

  async update(uuid: string, input: TUpdate): Promise<TRow> {
    const patch = definedFields(this.updateSchema.parse(input));
    // An empty patch returns the current row and writes nothing.
    if (Object.keys(patch).length === 0) {
      return this.getOrFail(uuid);
    }
    // An empty `returning()` means no row carried this uuid.
    const [row] = await this.db
      .update(this.table)
      .set(patch as never)
      .where(eq(this.table.uuid, uuid))
      .returning();
    if (!row) {
      throw this.notFound(uuid);
    }
    return row as TRow;
  }

  /** Returns the row as it stood when it was deleted. */
  async remove(uuid: string): Promise<TRow> {
    const [row] = await this.db
      .delete(this.table)
      .where(eq(this.table.uuid, uuid))
      .returning();
    if (!row) {
      throw this.notFound(uuid);
    }
    return row as TRow;
  }

  protected async getOrFail(uuid: string): Promise<TRow> {
    const row = await this.get(uuid);
    if (!row) {
      throw this.notFound(uuid);
    }
    return row;
  }

  protected notFound(uuid: string): NotFoundException {
    return new NotFoundException(`${this.entityName} not found: ${uuid}`);
  }
}

/**
 * zod keeps optional keys whose value is undefined, and drizzle counts those as
 * fields and then rejects the statement as empty. Only defined fields reach
 * `set()`.
 */
function definedFields(parsed: unknown): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).filter(
      ([, value]) => value !== undefined,
    ),
  );
}
