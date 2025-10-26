import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { KafkaModule } from "../kafka/kafka.module";
import { EventStoreModule } from "../EventStore/event-store.module";
import { CreateMemberHandler } from "./commands/create-member.handler";
import { DeleteMemberHandler } from "./commands/delete-member.handler";
import { GetMemberHandler } from "./commands/get-member.handler";
import { GetMembersHandler } from "./commands/get-members.handler";
import { UpdateMemberHandler } from "./commands/update-member.handler";
import { MemberCreatedProjection } from "./projections/member-created.projection";
import { MemberUpdatedProjection } from "./projections/member-updated.projection";
import { MemberDeletedProjection } from "./projections/member-deleted.projection";
import { MemberRepository } from "./member-repository";
import { MemberResolver } from "./member.resolver";

@Module({
  imports: [KafkaModule, CqrsModule, EventStoreModule],
  providers: [
    MemberResolver,
    CreateMemberHandler,
    DeleteMemberHandler,
    GetMemberHandler,
    GetMembersHandler,
    UpdateMemberHandler,
    // Repository
    MemberRepository,
    // Read model projections
    MemberCreatedProjection,
    MemberUpdatedProjection,
    MemberDeletedProjection,
  ],
})
export class MemberModule {}
