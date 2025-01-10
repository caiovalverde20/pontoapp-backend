import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Ponto } from "./Ponto";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @OneToMany(() => Ponto, (ponto) => ponto.user)
    pontos!: Ponto[];
}
