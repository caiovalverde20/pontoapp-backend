import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER || "user",
    password: process.env.POSTGRES_PASSWORD || "password",
    database: process.env.POSTGRES_DB || "pontoapp",
    entities: ["src/entities/*.ts"],
    synchronize: true,
  });
  

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
