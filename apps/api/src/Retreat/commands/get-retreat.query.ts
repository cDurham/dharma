import { Query } from "@nestjs/cqrs";
import type { RetreatEntity } from "../retreat.entity.js";

export class GetRetreatQuery extends Query<RetreatEntity | null> {
  constructor(public readonly uuid: string) {
    super();
  }
}
