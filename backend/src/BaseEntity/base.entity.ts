import { Field, ID, ObjectType } from "@nestjs/graphql";
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

@ObjectType()
export abstract class BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  uuid: string = uuidv4();

  @Field()
  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @Field()
  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
