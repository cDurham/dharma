import bcrypt from "bcryptjs";
import { Field, ObjectType } from "@nestjs/graphql";
import { BeforeInsert, Column, Entity, OneToMany, Unique } from "typeorm";
import { RefreshToken } from "../Auth/refresh-token.entity";
import { Person } from "../Person/person.entity";

@Entity()
@ObjectType()
@Unique(["email"])
export class User extends Person {
  @Field((_returns) => String)
  @Column({ unique: true })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Field((_returns) => String, { nullable: true })
  @Column({ type: "varchar", nullable: true })
  verificationToken!: string | null; // if null, the email is verified

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) this.password = await bcrypt.hash(this.password, 12);
  }

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];
}
