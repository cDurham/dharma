import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Person } from "../Person/person.entity";
import { User } from "../User/user.entity";

@Entity()
@ObjectType({ description: "Member" })
export class Member extends Person {
  @Field((type) => Date)
  @Column({
    name: "join_date",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  joinDate!: Date;

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user?: User;
}
