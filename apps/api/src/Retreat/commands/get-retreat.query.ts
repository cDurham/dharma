import { Query } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity.js";

export class GetRetreatQuery extends Query<Retreat | null> {
  constructor(public readonly uuid: string) {
    super();
  }
}
