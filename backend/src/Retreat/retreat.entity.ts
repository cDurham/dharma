import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "../BaseEntity/base.entity";

@Entity()
@ObjectType({ description: "Retreat" })
export class Retreat extends BaseEntity {
  @Field((type) => String)
  @Column()
  name!: string;

  @Field((type) => Date)
  @Column()
  startAt!: Date;

  @Field((type) => Date)
  @Column()
  endAt!: Date;
}
