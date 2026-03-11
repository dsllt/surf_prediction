import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/users';
import { Request, Response } from 'express';
import { BaseController } from '.';
import { AuthService } from '@src/services/auth';

@Controller('users')
export class UsersController extends BaseController {
  @Post('')
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const result = await user.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error as Error);
    }
  }

  @Post('authenticate')
  public async authenticateUser(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found',
      });
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Wrong user or password',
      });
    }

    const token = AuthService.generateToken(user.toJSON());

    return res.status(200).send({ token });
  }
}
