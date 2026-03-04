import { User } from '@src/models/users';
import { AuthService } from '@src/services/auth';

describe('Users functional testes', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When creating a new user', () => {
    it('should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'joe@email.com',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
      await expect(
        AuthService.comparePasswords(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
    });

    it('should return 400 when there is a validation error', async () => {
      const newUser = {
        name: 'John Doe',
        password: '1234',
      };

      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: email: Path `email` is required.',
      });
    });
    it('should return 409 when the email is already registered', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'joe@email.com',
        password: '1234',
      };

      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database',
      });
    });
  });

  describe.only('When authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'joe@email.com',
        password: '1234',
      };
      const user = new User(newUser);
      await user.save();

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: newUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('should return UNAUTHORIZED if the user email is not found', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'joe@email.com',
        password: '1234',
      };

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: newUser.password,
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        status: 401,
        error: 'User not found',
      });
    });

    it('should return UNAUTHORIZED if the user exists but the password does not match', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'joe@email.com',
        password: '1234',
      };
      const user = new User(newUser);
      await user.save();

      const response = await global.testRequest
        .post('/users/authenticate')
        .send({
          email: newUser.email,
          password: 'wrong_password',
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        status: 401,
        error: 'Wrong user or password',
      });
    });
  });
});
