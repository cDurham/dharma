import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailModule } from "../Email/email.module.js";
import { VerificationController } from "../Verify/verify.controller.js";
import { UserResolver } from "./user.resolver.js";
import { UserService } from "./user.service.js";

@Module({
  imports: [EmailModule, ConfigModule],
  controllers: [VerificationController],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
