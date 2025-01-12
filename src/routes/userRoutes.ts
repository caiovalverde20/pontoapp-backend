import { Router, Request, Response } from 'express';
import { AppDataSource } from '../database';
import { User } from '../entities/User';

const userRouter = Router();

userRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName } = req.body;

    if (!fullName) {
      res.status(400).json({ error: 'O nome completo é obrigatório' });
      return;
    }

    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) {
      res
        .status(400)
        .json({
          error:
            'O nome completo deve incluir pelo menos um primeiro e um último nome',
        });
      return;
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    const userRepo = AppDataSource.getRepository(User);
    const lastUser = await userRepo
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC')
      .getOne();
    const nextId = lastUser ? lastUser.id + 1 : 1;

    // Username vira o primeiro nome seguido do último nome com 2 digitos de sua id
    const idSuffix = String(nextId).padStart(2, '0').slice(0, 2);
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idSuffix}`;

    const user = new User();
    user.name = fullName;
    user.username = username;

    await userRepo.save(user);

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar o usuário' });
  }
});

userRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await AppDataSource.getRepository(User).find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

userRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: Number(id) },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o usuário' });
  }
});

userRouter.get(
  '/username/:username',
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

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar o usuário' });
    }
  }
);

export default userRouter;
