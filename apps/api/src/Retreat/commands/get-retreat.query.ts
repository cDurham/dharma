import { Query } from "@nestjs/cqrs";
import { Retreat } from "../retreat.entity";

export class GetRetreatQuery extends Query<Retreat | null> {
  constructor(public readonly uuid: string) {
    super();
  }
}
