import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Ponto } from "./entities/Ponto";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "pontoapp",
  synchronize: false, 
  logging: true,
  entities: [User, Ponto],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
