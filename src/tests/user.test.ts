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
  describe('POST /api/users', () => {
    it('Deve criar um usuário com sucesso', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ fullName: 'João Silva' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', 'joão.silva01');
    });

    it('Deve retornar erro ao criar um usuário sem fullName', async () => {
      const response = await request(app).post('/api/users').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'O nome completo é obrigatório'
      );
    });

    it('Deve retornar erro ao criar um usuário com fullName inválido', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ fullName: 'João' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'O nome completo deve incluir pelo menos um primeiro e um último nome'
      );
    });

    it('Deve criar múltiplos usuários e garantir usernames únicos', async () => {
      await request(app).post('/api/users').send({ fullName: 'João Silva' });
      const response = await request(app)
        .post('/api/users')
        .send({ fullName: 'João Silva' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('username', 'joão.silva02');
    });
  });

  describe('GET /api/users', () => {
    it('Deve retornar todos os usuários', async () => {
      await request(app).post('/api/users').send({ fullName: 'João Silva' });
      await request(app)
        .post('/api/users')
        .send({ fullName: 'Maria Oliveira' });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /api/users/:id', () => {
    it('Deve buscar um usuário existente pelo ID', async () => {
      const { body } = await request(app)
        .post('/api/users')
        .send({ fullName: 'João Silva' });
      const response = await request(app).get(`/api/users/${body.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', body.id);
      expect(response.body).toHaveProperty('username', 'joão.silva01');
    });

    it('Deve retornar erro ao buscar um ID inexistente', async () => {
      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('Deve retornar erro ao passar um ID inválido', async () => {
      const response = await request(app).get('/api/users/abc');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/users/username/:username', () => {
    it('Deve buscar um usuário existente pelo username', async () => {
      const { body } = await request(app)
        .post('/api/users')
        .send({ fullName: 'João Silva' });
      const response = await request(app).get(
        `/api/users/username/${body.username}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', body.username);
    });

    it('Deve retornar erro ao buscar um username inexistente', async () => {
      const response = await request(app).get(
        '/api/users/username/joão.inexistente'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('Deve retornar erro ao passar um username inválido', async () => {
      const response = await request(app).get('/api/users/username/');

      expect(response.status).toBe(404);
    });
  });
});
