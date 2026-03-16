import { Beach } from '@src/models/beach';
import { User } from '@src/models/users';
import { AuthService } from '@src/services/auth';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@email.com',
    password: '1234',
  };
  let token: string;
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.id);
  });

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33,
        lng: 151,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151,
        name: 'Manly',
        position: 'E',
      };

      const response = await global.testRequest
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it('should return 500 when there is any error other than validation error', async () => {
      const saveSpy = jest
        .spyOn(Beach.prototype, 'save')
        .mockRejectedValueOnce(new Error('Connection lost'));

      try {
        const newBeach = {
          lat: -33,
          lng: 151,
          name: 'Manly',
          position: 'E',
        };

        const response = await global.testRequest
          .post('/beaches')
          .set({ 'x-access-token': token })
          .send(newBeach);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          code: 500,
          error: 'Internal Server Error',
          message: 'Internal Server Error',
        });
      } finally {
        saveSpy.mockRestore();
      }
    });
  });
});
