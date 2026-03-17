import { UserRepository } from '.';
import { DefaultMongoDBRepository } from './defaultMongoDBRepository';
import { User } from '@src/models/users';

export class UserMongoDBRepository
  extends DefaultMongoDBRepository<User>
  implements UserRepository
{
  constructor(private userModel = User) {
    super(userModel);
  }
}
