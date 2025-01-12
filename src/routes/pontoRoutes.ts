import { Router, Request, Response } from 'express';
import { AppDataSource } from '../database';
import { Ponto } from '../entities/Ponto';
import { User } from '../entities/User';
import { IsNull, MoreThan, LessThan } from 'typeorm';

const workRouter = Router();

const getUserByUsername = async (username: string) => {
  return await AppDataSource.getRepository(User).findOne({
    where: { username },
  });
};

workRouter.post(
  '/start/:username',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({ error: 'O nome de usuário é obrigatório' });
        return;
      }

      const user = await AppDataSource.getRepository(User).findOne({
        where: { username },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const existingPonto = await AppDataSource.getRepository(Ponto).findOne({
        where: {
          user: { id: user.id },
          startTime: MoreThan(startOfDay),
          endTime: IsNull(),
        },
      });

      if (existingPonto) {
        res
          .status(400)
          .json({ error: 'Já existe um ponto aberto para este usuário hoje' });
        return;
      }

      const ponto = new Ponto();
      ponto.startTime = new Date();
      ponto.user = user;

      await AppDataSource.getRepository(Ponto).save(ponto);
      res.status(201).json(ponto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao iniciar o ponto' });
    }
  }
);

workRouter.patch(
  '/end/:username',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await AppDataSource.getRepository(User).findOne({
        where: { username },
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const ponto = await AppDataSource.getRepository(Ponto).findOne({
        where: { user: { id: user.id }, endTime: IsNull() },
      });

      if (!ponto) {
        res
          .status(404)
          .json({ error: 'Ponto não encontrado ou já finalizado' });
        return;
      }

      ponto.endTime = new Date();
      await AppDataSource.getRepository(Ponto).save(ponto);

      res.status(200).json(ponto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao finalizar o ponto' });
    }
  }
);

workRouter.get(
  '/user/:username',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const pontos = await AppDataSource.getRepository(Ponto).find({
        where: { user: { id: user.id } },
        order: { startTime: 'DESC' },
      });

      res.status(200).json(pontos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pontos do usuário' });
    }
  }
);

workRouter.get(
  '/user/:username/date',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const { date } = req.query;

      const user = await getUserByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      // Calcula o início e o fim do dia (hoje por padrão)
      const targetDate = date ? new Date(date as string) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const startOfDay = targetDate;
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const ponto = await AppDataSource.getRepository(Ponto).findOne({
        where: {
          user: { id: user.id },
          startTime: MoreThan(startOfDay),
          endTime: LessThan(endOfDay),
        },
      });

      if (!ponto) {
        res
          .status(404)
          .json({ error: 'Nenhum ponto encontrado para a data especificada' });
        return;
      }

      res.status(200).json(ponto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar ponto do usuário' });
    }
  }
);

workRouter.get(
  '/user/:username/week',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      const user = await getUserByUsername(username);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const pontos = await AppDataSource.getRepository(Ponto).find({
        where: [
          { user: { id: user.id }, startTime: MoreThan(monday) },
          { user: { id: user.id }, startTime: LessThan(sunday) },
        ],
        order: { startTime: 'ASC' },
      });

      const daysOfWeek = [
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
        'Domingo',
      ];
      const weekData = daysOfWeek.map((day, index) => {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + index);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const ponto = pontos.find(
          (p) =>
            new Date(p.startTime).toDateString() === dayStart.toDateString()
        );

        return {
          day,
          startTime: ponto?.startTime || null,
          endTime: ponto?.endTime || null,
        };
      });

      // total de horas na semana
      const totalHoursWeek = pontos.reduce((total, ponto) => {
        if (ponto.endTime) {
          const diff =
            new Date(ponto.endTime).getTime() -
            new Date(ponto.startTime).getTime();
          return total + diff / (1000 * 60 * 60);
        }
        return total;
      }, 0);

      res.status(200).json({
        weekData,
        totalHoursWeek: totalHoursWeek.toFixed(2),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pontos da semana' });
    }
  }
);

export default workRouter;
