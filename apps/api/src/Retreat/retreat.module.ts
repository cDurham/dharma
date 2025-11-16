import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { CreateRetreatHandler } from "./commands/create-retreat.handler.js";
import { DeleteRetreatHandler } from "./commands/delete-retreat.handler.js";
import { GetRetreatHandler } from "./commands/get-retreat.handler.js";
import { GetRetreatsHandler } from "./commands/get-retreats.handler.js";
import { UpdateRetreatHandler } from "./commands/update-retreat.handler.js";
import { RetreatCreatedHandler } from "./events/retreat-created.handler.js";
import { RetreatDeletedHandler } from "./events/retreat-deleted.handler.js";
import { RetreatUpdatedHandler } from "./events/retreat-updated.handler.js";
import { RetreatResolver } from "./retreat.resolver.js";

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
