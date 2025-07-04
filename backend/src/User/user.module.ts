import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailModule } from "../Email/email.module";
import { VerificationController } from "../Verify/verify.controller";
import { CreateUserHandler } from "./command/create-user.handler";
import { DeleteUserHandler } from "./command/delete-user.handler";
import { GetUserByEmailHandler } from "./command/get-user-by-email.handler";
import { UpdateUserHandler } from "./command/update-user.handler";
import { VerifyEmailHandler } from "./command/verify-email.handler";
import { User } from "./user.entity";
import { UserResolver } from "./user.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    ConfigModule,
    CqrsModule,
  ],
  providers: [
    UserResolver,
    VerificationController,
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserByEmailHandler,
    VerifyEmailHandler,
  ],
  exports: [TypeOrmModule],
})
export class UserModule {}
