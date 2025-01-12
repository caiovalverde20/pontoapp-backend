import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Ponto } from './entities/Ponto';

const isTestEnv = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource(
  isTestEnv
    ? {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        entities: [User, Ponto],
        logging: false,
      }
    : {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        database: process.env.POSTGRES_DB || 'pontoapp',
        synchronize: true,
        logging: true,
        entities: [
          process.env.NODE_ENV === 'production'
            ? 'dist/entities/*.js'
            : 'src/entities/*.ts',
        ],
      }
);

export const initializeDatabase = async (retries = 5, delay = 3000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log('Database connected!');
      return;
    } catch (err) {
      console.error(`Database connection failed (${i + 1}/${retries}):`, err);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error('Unable to connect to the database after multiple attempts.');
};


if (!isTestEnv) {
  AppDataSource.initialize()
    .then(() => {
      console.log('Database connected!');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
}
