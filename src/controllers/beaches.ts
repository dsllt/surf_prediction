import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Request, Response } from 'express';
import { BaseController } from '.';
import { BeachRepository } from '@src/repositories';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Post('')
  public async createBeach(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.context?.userId;
      const result = await this.beachRepository.create({ ...req.body, userId });
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error as Error);
    }
  }
}
