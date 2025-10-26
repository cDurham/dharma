import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { EventStoreModule } from "../EventStore/event-store.module";
import { KafkaModule } from "../kafka/kafka.module";
import { CreateRetreatHandler } from "./commands/create-retreat.handler";
import { DeleteRetreatHandler } from "./commands/delete-retreat.handler";
import { GetRetreatHandler } from "./commands/get-retreat.handler";
import { GetRetreatsHandler } from "./commands/get-retreats.handler";
import { UpdateRetreatHandler } from "./commands/update-retreat.handler";
import { RetreatCreatedHandler } from "./events/retreat-created.handler";
import { RetreatDeletedHandler } from "./events/retreat-deleted.handler";
import { RetreatUpdatedHandler } from "./events/retreat-updated.handler";
import { RetreatCreatedProjection } from "./projections/retreat-created.projection";
import { RetreatUpdatedProjection } from "./projections/retreat-updated.projection";
import { RetreatDeletedProjection } from "./projections/retreat-deleted.projection";
import { RetreatRepository } from "./retreat-repository";
import { RetreatResolver } from "./retreat.resolver";

@Module({
  imports: [KafkaModule, CqrsModule, EventStoreModule],
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
    // Repository
    RetreatRepository,
    // Read model projections
    RetreatCreatedProjection,
    RetreatUpdatedProjection,
    RetreatDeletedProjection,
  ],
})
export class RetreatModule {}
