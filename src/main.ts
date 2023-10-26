import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

const _logger: Logger = new Logger(AppModule.name);
let _port: string;
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  // Acquire the config service
  const config = app.get(ConfigService);
  _port = config.get<string>('API_PORT');
  await app.listen(_port);
}

bootstrap().then(() => _logger.log(`App listening on port ${_port}`));
