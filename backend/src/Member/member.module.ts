import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KafkaModule } from "../kafka/kafka.module";
import { CreateMemberHandler } from "./commands/create-member.handler";
import { GetMemberHandler } from "./commands/get-member.handler";
import { GetMembersHandler } from "./commands/get-members.handler";
import { MemberCreatedHandler } from "./events/member-created.handler";
import { Member } from "./member.entity";
import { MemberResolver } from "./member.resolver";

@Module({
  imports: [KafkaModule, TypeOrmModule.forFeature([Member]), CqrsModule],
  providers: [
    MemberResolver,
    CreateMemberHandler,
    GetMemberHandler,
    GetMembersHandler,
    MemberCreatedHandler,
  ],
})
export class MemberModule {}
