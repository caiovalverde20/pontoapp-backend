import request from 'supertest';
import { AppDataSource } from '../database';
import app from '../app';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.query('PRAGMA foreign_keys = OFF'); 
    await AppDataSource.dropDatabase();
    await AppDataSource.synchronize();
    await AppDataSource.query('PRAGMA foreign_keys = ON');
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('User API', () => {
  test('Deve criar um usuário', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ fullName: 'João Silva' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('username');
  });

  test('Deve retornar todos os usuários', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
