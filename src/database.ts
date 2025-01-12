import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Ponto } from './entities/Ponto';

// Define o ambiente de teste
const isTestEnv = process.env.NODE_ENV === 'test';

// Criação do DataSource com suporte para tentativas de conexão
export const AppDataSource = new DataSource(
  isTestEnv
    ? {
        type: 'sqlite', // Banco de dados em memória para testes
        database: ':memory:',
        synchronize: true,
        dropSchema: true,
        entities: [User, Ponto],
        logging: false,
      }
    : {
        type: 'postgres', // Banco PostgreSQL
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        database: process.env.POSTGRES_DB || 'pontoapp',
        synchronize: true,
        logging: true,
        entities: [
          process.env.NODE_ENV === 'production'
            ? 'dist/entities/*.js' // Build em produção
            : 'src/entities/*.ts', // Desenvolvimento local
        ],
      }
);

// Função para inicializar o banco com tentativas de reconexão
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


// Inicializa o banco apenas fora dos testes
if (!isTestEnv) {
  AppDataSource.initialize()
    .then(() => {
      console.log('Database connected!');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
}
