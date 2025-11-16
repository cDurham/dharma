import { Query } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity.js";

export class GetRetreatsQuery extends Query<Retreat[]> {}
