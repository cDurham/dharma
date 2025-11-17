import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { EmailModule } from "../Email/email.module.js";
import { VerificationController } from "../Verify/verify.controller.js";
import { CreateUserHandler } from "./command/create-user.handler.js";
import { DeleteUserHandler } from "./command/delete-user.handler.js";
import { GetUserByEmailHandler } from "./command/get-user-by-email.handler.js";
import { GetUserHandler } from "./command/get-user.handler.js";
import { GetUsersHandler } from "./command/get-users.handler.js";
import { ResendVerificationEmailHandler } from "./command/resend-verification-email.handler.js";
import { UpdateUserHandler } from "./command/update-user.handler.js";
import { VerifyEmailHandler } from "./command/verify-email.handler.js";
import { UserCreatedHandler } from "./event/user-created.handler.js";
import { UserDeletedHandler } from "./event/user-deleted.handler.js";
import { UserUpdatedHandler } from "./event/user-updated.handler.js";
import { UserResolver } from "./user.resolver.js";

@Module({
  imports: [EmailModule, ConfigModule, CqrsModule],
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
    ResendVerificationEmailHandler,
    VerifyEmailHandler,
    // Event handlers
    UserCreatedHandler,
    UserDeletedHandler,
    UserUpdatedHandler,
  ],
})
export class UserModule {}
