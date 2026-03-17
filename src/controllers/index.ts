import logger from '@src/logger';
import {
  DatabaseDuplicatedError,
  DatabaseError,
  DatabaseValidationError,
} from '@src/repositories/repository';
import ApiError, { APIError } from '@src/utils/errors/api-error';
import { Response } from 'express';
export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(res: Response, error: unknown): void {
    if (
      error instanceof DatabaseValidationError ||
      error instanceof DatabaseDuplicatedError
    ) {
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

  private handleClientErrors(error: DatabaseError): {
    code: number;
    error: string;
  } {
    if (error instanceof DatabaseDuplicatedError) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
