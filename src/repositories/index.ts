import { Beach } from '@src/models/beach';
import { User } from '@src/models/users';

export type WithId<T> = { id: string } & T;
export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
  create(data: T): Promise<WithId<T>>;
  find(filter: FilterOptions): Promise<WithId<T>[]>;
}

export interface BeachRepository extends BaseRepository<Beach> {
  findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]>;
}

export type UserRepository = BaseRepository<User>;
