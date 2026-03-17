import { Error, Model } from 'mongoose';
import { FilterOptions, WithId } from '.';
import {
  DatabaseDuplicatedError,
  DatabaseInternalError,
  DatabaseUnknownClientError,
  DatabaseValidationError,
  Repository,
} from './repository';
import { BaseModel } from '@src/models';
import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/users';

export abstract class DefaultMongoDBRepository<
  T extends BaseModel,
> extends Repository<T> {
  constructor(private model: Model<T>) {
    super();
  }

  public async create(data: T): Promise<WithId<T>> {
    try {
      const model = new this.model(data);
      const createdData = await model.save();
      return createdData.toJSON<WithId<T>>();
    } catch (error) {
      this.handleError(error);
    }
  }

  public async find(filter: FilterOptions): Promise<WithId<T>[]> {
    try {
      const data = await this.model.find(filter);
      return data.map((d) => d.toJSON<WithId<T>>());
    } catch (error) {
      this.handleError(error);
    }
  }
  protected handleError(error: unknown): never {
    if (error instanceof Error.ValidationError) {
      const validationErrorsKind = Object.values(error.errors).filter(
        (error) => {
          return (
            (error.name === 'CastError' || error.name === 'ValidatorError') &&
            (error.kind === 'Number' || error.kind === 'required')
          );
        }
      );

      const duplicatedErrorsKind = Object.values(error.errors).filter(
        (error) =>
          error.name === 'ValidatorError' &&
          error.kind === CUSTOM_VALIDATION.DUPLICATED
      );

      if (duplicatedErrorsKind.length > 0) {
        throw new DatabaseDuplicatedError(error.message);
      }

      if (validationErrorsKind.length > 0) {
        throw new DatabaseValidationError(error.message);
      }
      throw new DatabaseUnknownClientError(error.message);
    }
    logger.error(`Database error: ${error}`);
    throw new DatabaseInternalError(
      'Something unexpected happened to the database.'
    );
  }
}
