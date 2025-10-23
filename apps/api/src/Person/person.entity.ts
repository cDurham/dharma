import { Entity, Column } from "typeorm";
import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity } from "../BaseEntity/base.entity";

@ObjectType()
@Entity()
export class Person extends BaseEntity {
  @Field((type) => String)
  @Column({ name: "first_name" })
  firstName!: string;

  @Field((type) => String)
  @Column({ name: "last_name" })
  lastName!: string;
}
