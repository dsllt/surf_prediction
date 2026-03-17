import swaggerUi from 'swagger-ui-express';
import apiSchema from './api-schema.json';
import { Server } from '@overnightjs/core';
import './utils/module-alias';
import bodyParser from 'body-parser';
import * as database from '@src/database';
import { ForecastController } from './controllers/forecast';
import { Application } from 'express';
import { BeachesController } from './controllers/beaches';
import { UsersController } from './controllers/users';
import logger from './logger';
import expressPino from 'express-pino-logger';
import cors from 'cors';
import * as OpenApiValidator from 'express-openapi-validator';
import { BeachMongoDBRepository } from './repositories/beachMongoDbRepository';
import { UserMongoDBRepository } from './repositories/userMongoDbRepository';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    this.docsSetup();
    await this.databaseSetup();
  }

  public start(): void {
    this.app.listen(this.port, '0.0.0.0', () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.set('trust proxy', true);
    this.app.use(
      expressPino({ logger } as unknown as Parameters<typeof expressPino>[0])
    );
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
  }

  private setupControllers() {
    const beachRepository = new BeachMongoDBRepository();
    const userRepository = new UserMongoDBRepository();
    const forecastController = new ForecastController(beachRepository);
    const beachesController = new BeachesController(beachRepository);
    const usersController = new UsersController(userRepository);
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  private docsSetup(): void {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as Parameters<
          typeof OpenApiValidator.middleware
        >[0]['apiSpec'],
        validateRequests: true,
        validateResponses: true,
      })
    );
  }
}
