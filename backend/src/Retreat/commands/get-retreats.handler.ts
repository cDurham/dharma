import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Repository } from "typeorm";
import { Retreat } from "../retreat.entity";
import { GetRetreatsQuery } from "./get-retreats.query";

@QueryHandler(GetRetreatsQuery)
export class GetRetreatsHandler implements IQueryHandler<GetRetreatsQuery> {
  constructor(private readonly retreatRepo: Repository<Retreat>) {}

  async execute(): Promise<Retreat[]> {
    return this.retreatRepo.find();
  }
}
