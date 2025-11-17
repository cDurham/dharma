import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "../kafka/kafka.module.js";
import { CreateMemberHandler } from "./commands/create-member.handler.js";
import { DeleteMemberHandler } from "./commands/delete-member.handler.js";
import { GetMemberHandler } from "./commands/get-member.handler.js";
import { GetMembersHandler } from "./commands/get-members.handler.js";
import { UpdateMemberHandler } from "./commands/update-member.handler.js";
import { MemberCreatedHandler } from "./events/member-created.handler.js";
import { MemberDeletedHandler } from "./events/member-deleted.handler.js";
import { MemberUpdatedHandler } from "./events/member-updated.handler.js";
import { MemberResolver } from "./member.resolver.js";

@Module({
  imports: [KafkaModule, CqrsModule],
  providers: [
    MemberResolver,
    CreateMemberHandler,
    DeleteMemberHandler,
    GetMemberHandler,
    GetMembersHandler,
    UpdateMemberHandler,
    MemberCreatedHandler,
    MemberDeletedHandler,
    MemberUpdatedHandler,
  ],
})
export class MemberModule {}
