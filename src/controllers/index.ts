import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/users';
import ApiError, { APIError } from '@src/utils/errors/api-error';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';
export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: MongooseError.ValidationError | Error
  ): void {
    if (error instanceof MongooseError.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Internal Server Error' }));
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

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
