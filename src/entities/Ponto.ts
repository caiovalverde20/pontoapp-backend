import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Ponto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  startTime!: Date;

  @Column({ nullable: true })
  endTime?: Date;

  @ManyToOne(() => User, (user) => user.pontos, { onDelete: "CASCADE" })
  user!: User;
}
