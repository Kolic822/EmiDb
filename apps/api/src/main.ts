import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { networkInterfaces } from 'node:os';
import { AppModule } from './app.module.js';
import { SqliteExceptionFilter } from './common/sqlite-exception.filter.js';
import { config } from './config.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Behind Railway/Render every request comes from the proxy; trust it for the real client address.
  if (config.trustProxy) app.set('trust proxy', 1);
  app.setGlobalPrefix('api');
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
  await app.listen(config.port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`emidb is running at http://localhost:${config.port}`);
  for (const address of lanAddresses()) {
    logger.log(`On this network (tablets, other computers): http://${address}:${config.port}`);
  }
}

/** IPv4 addresses of the machine's network adapters, Wi-Fi/Ethernet first. */
function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === 'IPv4' && !net.internal)
    .map((net) => net!.address)
    .filter((address) => !address.startsWith('169.254.'));
}
await bootstrap();
