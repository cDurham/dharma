import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { v7 as uuidv7 } from "uuid";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { DB_TOKEN } from "../../db/database.module";
import { db as DbType } from "../../db/data-source";
import { user } from "../../db/schema";
import { UserCreatedEvent } from "../event/user-created.event";
import { User } from "../user.entity";
import { CreateUserCommand } from "./create-user.command";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(DB_TOKEN)
    private readonly db: typeof DbType,
    private eventBus: EventBus
  ) {}

  async execute({ data }: CreateUserCommand): Promise<User> {
    const newUserId = uuidv7();
    const verificationToken = uuidv4();

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Insert user
    await this.db.insert(user).values({
      uuid: newUserId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      verificationToken,
    });

    // Fetch the created user
    const [savedUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.uuid, newUserId));

    // Emit event - all side effects handled by event handlers
    this.eventBus.publish(
      new UserCreatedEvent(
        savedUser.uuid,
        savedUser.email,
        verificationToken, // We need this, not in DB
        savedUser.firstName
      )
    );

    return savedUser;
  }
}
