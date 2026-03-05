import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
  @Post('')
  public async createBeach(req: Request, res: Response): Promise<void> {
    try {
      const user = req.decoded;
      const beach = new Beach({ ...req.body, user: user?.id });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (err) {
      const formattedErr = err as { message: string };
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: formattedErr.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}
