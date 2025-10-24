import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "../kafka/kafka.module";
import { CreateMemberHandler } from "./commands/create-member.handler";
import { DeleteMemberHandler } from "./commands/delete-member.handler";
import { GetMemberHandler } from "./commands/get-member.handler";
import { GetMembersHandler } from "./commands/get-members.handler";
import { UpdateMemberHandler } from "./commands/update-member.handler";
import { MemberCreatedHandler } from "./events/member-created.handler";
import { MemberDeletedHandler } from "./events/member-deleted.handler";
import { MemberUpdatedHandler } from "./events/member-updated.handler";
import { MemberResolver } from "./member.resolver";

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
