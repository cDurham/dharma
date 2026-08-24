import { Module } from "@nestjs/common";
import { UserModule } from "../User/user.module.js";
import { MemberResolver } from "./member.resolver.js";
import { MemberService } from "./member.service.js";

@Module({
  imports: [UserModule],
  providers: [MemberResolver, MemberService],
  exports: [MemberService],
})
export class MemberModule {}
