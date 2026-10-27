import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SqliteExceptionFilter } from './common/sqlite-exception.filter.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new SqliteExceptionFilter());
  app.enableShutdownHooks();
  await app.listen(config.port);
  new Logger('Bootstrap').log(`API listening on http://localhost:${config.port}/api`);
}
await bootstrap();
