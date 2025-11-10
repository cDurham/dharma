import { Query } from "@nestjs/cqrs";
import { Retreat } from "../retreat.entity";

export class GetRetreatsQuery extends Query<Retreat[]> {}
