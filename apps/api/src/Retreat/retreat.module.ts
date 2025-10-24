import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Retreat } from "./retreat.entity";

import { CreateRetreatHandler } from "./commands/create-retreat.handler";
import { DeleteRetreatHandler } from "./commands/delete-retreat.handler";
import { GetRetreatHandler } from "./commands/get-retreat.handler";
import { GetRetreatsHandler } from "./commands/get-retreats.handler";
import { UpdateRetreatHandler } from "./commands/update-retreat.handler";
import { RetreatCreatedHandler } from "./events/retreat-created.handler";
import { RetreatDeletedHandler } from "./events/retreat-deleted.handler";
import { RetreatUpdatedHandler } from "./events/retreat-updated.handler";
import { RetreatResolver } from "./retreat.resolver";
import { Repository } from "typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Retreat]), CqrsModule],
  providers: [
    CreateRetreatHandler,
    DeleteRetreatHandler,
    GetRetreatHandler,
    GetRetreatsHandler,
    Repository,
    RetreatCreatedHandler,
    RetreatDeletedHandler,
    RetreatResolver,
    RetreatUpdatedHandler,
    UpdateRetreatHandler,
  ],
})
export class RetreatModule {}
