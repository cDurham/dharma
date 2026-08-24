import { Inject, Injectable, Logger } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { z } from "zod";
import { CrudService } from "../Domain/crud.service.js";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { user } from "../db/schema/index.js";
import type { UserRow } from "../db/types.js";
import { EmailService } from "../Email/email.service.js";
import type { CreateUserInput, UpdateUserInput } from "./user.input.js";
import { CreateUserSchema, UpdateUserSchema } from "./user.schema.js";

const PASSWORD_ROUNDS = 12;

@Injectable()
export class UserService extends CrudService<
  UserRow,
  z.input<typeof CreateUserSchema>,
  z.input<typeof UpdateUserSchema>
> {
  protected readonly entityName = "User";
  protected readonly table = user;
  protected readonly createSchema = CreateUserSchema;
  protected readonly updateSchema = UpdateUserSchema;

  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DB_TOKEN)
    db: typeof DbType,
    private readonly emailService: EmailService,
  ) {
    super(db);
  }

  async getByEmail(email: string): Promise<UserRow | null> {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));
    return row ?? null;
  }

  override async create(input: CreateUserInput): Promise<UserRow> {
    const verificationToken = uuidv4();
    const row = await super.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: await bcrypt.hash(input.password, PASSWORD_ROUNDS),
      verificationToken,
    });

    // A failed send is not a failed registration; the token stays in the row
    // and resendVerificationEmail covers recovery.
    try {
      await this.emailService.sendVerificationEmail(
        row.email,
        verificationToken,
      );
      this.logger.log(`Verification email sent to: ${row.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${row.email}:`,
        error,
      );
    }

    return row;
  }

  override async update(uuid: string, data: UpdateUserInput): Promise<UserRow> {
    return super.update(uuid, {
      ...data,
      ...(data.password === undefined
        ? {}
        : { password: await bcrypt.hash(data.password, PASSWORD_ROUNDS) }),
    });
  }

  async verifyEmail(token: string): Promise<boolean> {
    const [row] = await this.db
      .update(user)
      .set({ verificationToken: null })
      .where(eq(user.verificationToken, token))
      .returning();
    return row !== undefined;
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    const existing = await this.getByEmail(email);
    if (!existing) {
      this.logger.warn(
        `Resend verification requested for unknown email: ${email}`,
      );
      return false;
    }
    if (!existing.verificationToken) {
      this.logger.log(
        `Resend verification skipped; user already verified: ${email}`,
      );
      return false;
    }
    const newVerificationToken = uuidv4();
    await this.db
      .update(user)
      .set({ verificationToken: newVerificationToken })
      .where(eq(user.uuid, existing.uuid));
    await this.emailService.sendVerificationEmail(email, newVerificationToken);
    this.logger.log(`Resent verification email to: ${email}`);
    return true;
  }
}
