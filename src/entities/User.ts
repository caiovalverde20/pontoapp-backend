import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Ponto } from "./Ponto";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  username!: string;

  @OneToMany(() => Ponto, (ponto) => ponto.user)
  pontos!: Ponto[];
}
