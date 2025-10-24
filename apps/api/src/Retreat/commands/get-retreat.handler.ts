import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Retreat } from "../retreat.entity";
import { GetRetreatQuery } from "./get-retreat.query";

@QueryHandler(GetRetreatQuery)
export class GetRetreatHandler
  implements IQueryHandler<GetRetreatQuery, Retreat | null>
{
  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepo: Repository<Retreat>
  ) {}

  async execute({ uuid }: GetRetreatQuery) {
    return this.retreatRepo.findOne({ where: { uuid } });
  }
}
