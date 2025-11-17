import { Query } from "@nestjs/cqrs";
import type { RetreatEntity } from "../retreat.entity.js";

export class GetRetreatsQuery extends Query<RetreatEntity[]> {}
