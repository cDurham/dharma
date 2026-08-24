import { Module } from "@nestjs/common";
import { RetreatResolver } from "./retreat.resolver.js";
import { RetreatService } from "./retreat.service.js";

@Module({
  providers: [RetreatResolver, RetreatService],
  exports: [RetreatService],
})
export class RetreatModule {}
