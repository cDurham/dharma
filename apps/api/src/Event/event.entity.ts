import { Field, ObjectType } from "@nestjs/graphql";
import { Entity, Column } from "typeorm";
import { BaseEntity } from "../BaseEntity/base.entity";

enum EventType {
  RETREAT = "Retreat",
  TALK = "Talk",
  WORKSHOP = "Workshop",
  MEDITATION = "Meditation",
}

@Entity()
@ObjectType({ description: "Event" })
export class Event extends BaseEntity {
  @Field((type) => String)
  @Column()
  name!: string;

  @Field((type) => EventType)
  @Column()
  type!: EventType;
}
