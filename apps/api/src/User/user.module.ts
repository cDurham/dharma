import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { EmailModule } from "../Email/email.module";
import { VerificationController } from "../Verify/verify.controller";
import { KafkaModule } from "../kafka/kafka.module";
import { CreateUserHandler } from "./command/create-user.handler";
import { DeleteUserHandler } from "./command/delete-user.handler";
import { GetUserByEmailHandler } from "./command/get-user-by-email.handler";
import { GetUserHandler } from "./command/get-user.handler";
import { GetUsersHandler } from "./command/get-users.handler";
import { UpdateUserHandler } from "./command/update-user.handler";
import { VerifyEmailHandler } from "./command/verify-email.handler";
import { UserCreatedHandler } from "./event/user-created.handler";
import { UserDeletedHandler } from "./event/user-deleted.handler";
import { UserUpdatedHandler } from "./event/user-updated.handler";
import { UserResolver } from "./user.resolver";

@Module({
  imports: [EmailModule, KafkaModule, ConfigModule, CqrsModule],
  providers: [
    UserResolver,
    VerificationController,
    // Command handlers
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserByEmailHandler,
    GetUserHandler,
    GetUsersHandler,
    VerifyEmailHandler,
    // Event handlers
    UserCreatedHandler,
    UserDeletedHandler,
    UserUpdatedHandler,
  ],
})
export class UserModule {}
