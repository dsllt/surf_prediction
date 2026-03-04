import { CUSTOM_VALIDATION } from '@src/models/users';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';
export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: MongooseError.ValidationError | Error
  ): void {
    if (error instanceof MongooseError.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(clientErrors);
    } else {
      res.status(500).send({ code: 500, error: 'Internal Server Error' });
    }
  }

  private handleClientErrors(error: MongooseError.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }
}
