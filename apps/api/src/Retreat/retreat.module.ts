import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { CreateRetreatHandler } from "./commands/create-retreat.handler";
import { DeleteRetreatHandler } from "./commands/delete-retreat.handler";
import { GetRetreatHandler } from "./commands/get-retreat.handler";
import { GetRetreatsHandler } from "./commands/get-retreats.handler";
import { UpdateRetreatHandler } from "./commands/update-retreat.handler";
import { RetreatCreatedHandler } from "./events/retreat-created.handler";
import { RetreatDeletedHandler } from "./events/retreat-deleted.handler";
import { RetreatUpdatedHandler } from "./events/retreat-updated.handler";
import { RetreatResolver } from "./retreat.resolver";

@Module({
  imports: [CqrsModule],
  providers: [
    CreateRetreatHandler,
    DeleteRetreatHandler,
    GetRetreatHandler,
    GetRetreatsHandler,
    RetreatCreatedHandler,
    RetreatDeletedHandler,
    RetreatResolver,
    RetreatUpdatedHandler,
    UpdateRetreatHandler,
  ],
})
export class RetreatModule {}
