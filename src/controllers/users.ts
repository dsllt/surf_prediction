import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/users';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  @Post('')
  public async createUser(req: Request, res: Response): Promise<void> {
    const user = new User(req.body);
    const result = await user.save();
    res.status(201).send(result);
  }
}
