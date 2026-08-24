import { Inject, Injectable, Logger } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import type { db as DbType } from "../db/data-source.js";
import { DB_TOKEN } from "../db/database.module.js";
import { user } from "../db/schema/index.js";
import type { UserRow } from "../db/types.js";
import { EmailService } from "../Email/email.service.js";
import type { CreateUserInput, UpdateUserInput } from "./user.input.js";
import type { UpdateUserData } from "./user.schema.js";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private readonly emailService: EmailService,
  ) {}

  async list(): Promise<UserRow[]> {
    return this.db.select().from(user);
  }

  async get(uuid: string): Promise<UserRow | null> {
    const [row] = await this.db.select().from(user).where(eq(user.uuid, uuid));
    return row ?? null;
  }

  async getByEmail(email: string): Promise<UserRow | null> {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email));
    return row ?? null;
  }

  async create(input: CreateUserInput): Promise<UserRow> {
    const uuid = uuidv7();
    const verificationToken = uuidv4();
    const hashedPassword = await bcrypt.hash(input.password, 12);
    await this.db.insert(user).values({
      uuid,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
      verificationToken,
    });
    const [row] = await this.db.select().from(user).where(eq(user.uuid, uuid));

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

  async update(uuid: string, data: UpdateUserInput): Promise<UserRow | null> {
    const existing = await this.get(uuid);
    if (!existing) {
      return null;
    }
    const updateData: UpdateUserData = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    await this.db
      .update(user)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(user.uuid, uuid));
    const [row] = await this.db.select().from(user).where(eq(user.uuid, uuid));
    return row;
  }

  async remove(uuid: string): Promise<boolean> {
    const existing = await this.get(uuid);
    if (!existing) {
      throw new Error("User not found");
    }
    await this.db.delete(user).where(eq(user.uuid, uuid));
    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.verificationToken, token));
    if (!row) {
      return false;
    }
    await this.db
      .update(user)
      .set({ verificationToken: null, updatedAt: new Date() })
      .where(eq(user.uuid, row.uuid));
    return true;
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
      .set({ verificationToken: newVerificationToken, updatedAt: new Date() })
      .where(eq(user.uuid, existing.uuid));
    await this.emailService.sendVerificationEmail(email, newVerificationToken);
    this.logger.log(`Resent verification email to: ${email}`);
    return true;
  }
}
