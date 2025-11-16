import { Query } from "@nestjs/cqrs";
import type { Retreat } from "../retreat.entity";

export class GetRetreatsQuery extends Query<Retreat[]> {}
