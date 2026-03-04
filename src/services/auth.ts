import bcrypt from 'bcrypt';
import config, { IConfig } from 'config';
import jwt from 'jsonwebtoken';
export class AuthService {
  authConfig: IConfig = config.get('App.auth');

  public static async hashPassword(
    password: string,
    salt: number = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(payload: object): string {
    const authKey = config.get<string>('App.auth.key');
    const expirationTime = config.get<number>('App.auth.tokenExpiresIn');
    return jwt.sign(payload, authKey, { expiresIn: expirationTime });
  }
}
