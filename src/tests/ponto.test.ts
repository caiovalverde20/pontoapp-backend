import request from 'supertest';
import { AppDataSource } from '../database';
import app from '../app';
import { User } from '../entities/User';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.dropDatabase();
    await AppDataSource.synchronize();

    const userRepo = AppDataSource.getRepository(User);
    const user = new User();
    user.name = 'Test User';
    user.username = 'test.user01';
    await userRepo.save(user);
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Ponto API', () => {
  describe('POST /ponto/start/:username', () => {
    it('Deve iniciar um ponto para um usuário válido', async () => {
      const response = await request(app).post('/api/ponto/start/test.user01');
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('startTime');
    });

    it('Deve retornar erro ao iniciar ponto para usuário inexistente', async () => {
      const response = await request(app).post('/api/ponto/start/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    });

    it('Deve retornar erro ao iniciar ponto sem informar username', async () => {
      const response = await request(app).post('/api/ponto/start/');
      expect(response.status).toBe(404);
    });

    it('Deve retornar erro ao iniciar ponto já aberto', async () => {
      await request(app).post('/api/ponto/start/test.user01');
      const response = await request(app).post('/api/ponto/start/test.user01');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Já existe um ponto aberto para este usuário hoje',
      });
    });
  });

  describe('PATCH /ponto/end/:username', () => {
    it('Deve finalizar um ponto aberto com sucesso', async () => {
      await request(app).post('/api/ponto/start/test.user01');
      const response = await request(app).patch('/api/ponto/end/test.user01');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('endTime');
    });

    it('Deve retornar erro ao finalizar ponto para usuário inexistente', async () => {
      const response = await request(app).patch('/api/ponto/end/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    });

    it('Deve retornar erro ao finalizar ponto sem ponto aberto', async () => {
      const response = await request(app).patch('/api/ponto/end/test.user01');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Ponto não encontrado ou já finalizado',
      });
    });
  });

  describe('GET /ponto/user/:username', () => {
    it('Deve buscar todos os pontos de um usuário válido', async () => {
      await request(app).post('/api/ponto/start/test.user01');
      const response = await request(app).get('/api/ponto/user/test.user01');
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('Deve retornar erro ao buscar pontos para usuário inexistente', async () => {
      const response = await request(app).get('/api/ponto/user/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    });
  });

  describe('GET /ponto/user/:username/date', () => {
    it('Deve buscar ponto por data específica', async () => {
      const now = new Date();
      await request(app).post('/api/ponto/start/test.user01');
      await request(app).patch('/api/ponto/end/test.user01');
      const response = await request(app).get(
        `/api/ponto/user/test.user01/date?date=${now.toISOString()}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('startTime');
      expect(response.body).toHaveProperty('endTime');
    });

    it('Deve falhar em achar ponto em data específica', async () => {
      const now = new Date();
      await request(app).post('/api/ponto/start/test.user01');
      const response = await request(app).get(
        `/api/ponto/user/test.user01/date?date=${now.toISOString()}`
      );
      expect(response.status).toBe(404);
    });

    it('Deve retornar erro ao buscar pontos para usuário inexistente', async () => {
      const response = await request(app).get(
        '/api/ponto/user/nonexistent/date'
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    });

    it('Deve retornar erro para data sem ponto', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const response = await request(app).get(
        `/api/ponto/user/test.user01/date?date=${futureDate.toISOString()}`
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Nenhum ponto encontrado para a data especificada',
      });
    });
  });

  describe('GET /ponto/user/:username/week', () => {
    it('Deve buscar pontos da semana para o usuário', async () => {
      await request(app).post('/api/ponto/start/test.user01');
      const response = await request(app).get(
        '/api/ponto/user/test.user01/week'
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('weekData');
    });

    it('Deve retornar erro ao buscar pontos da semana para usuário inexistente', async () => {
      const response = await request(app).get(
        '/api/ponto/user/nonexistent/week'
      );
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Usuário não encontrado' });
    });
  });
});
