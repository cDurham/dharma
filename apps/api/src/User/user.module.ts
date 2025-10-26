import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { EmailModule } from "../Email/email.module";
import { KafkaModule } from "../kafka/kafka.module";
import { EventStoreModule } from "../EventStore/event-store.module";
import { VerificationController } from "../Verify/verify.controller";
import { CreateUserHandler } from "./command/create-user.handler";
import { DeleteUserHandler } from "./command/delete-user.handler";
import { GetUserByEmailHandler } from "./command/get-user-by-email.handler";
import { GetUserHandler } from "./command/get-user.handler";
import { GetUsersHandler } from "./command/get-users.handler";
import { UpdateUserHandler } from "./command/update-user.handler";
import { VerifyEmailHandler } from "./command/verify-email.handler";
import { UserRepository } from "./user-repository";
import { UserCreatedProjection } from "./projections/user-created.projection";
import { UserUpdatedProjection } from "./projections/user-updated.projection";
import { UserPasswordChangedProjection } from "./projections/user-password-changed.projection";
import { UserEmailChangedProjection } from "./projections/user-email-changed.projection";
import { UserDeletedProjection } from "./projections/user-deleted.projection";
import { UserEmailVerifiedProjection } from "./projections/user-email-verified.projection";
import { UserResolver } from "./user.resolver";

@Module({
  imports: [EmailModule, KafkaModule, ConfigModule, CqrsModule, EventStoreModule],
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
    // Repository
    UserRepository,
    // Read model projections
    UserCreatedProjection,
    UserUpdatedProjection,
    UserPasswordChangedProjection,
    UserEmailChangedProjection,
    UserEmailVerifiedProjection,
    UserDeletedProjection,
  ],
})
export class UserModule {}
