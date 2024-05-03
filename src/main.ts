import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ConfigService } from '@nestjs/config';
import { BusinessExceptionFilter } from './exception';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new BusinessExceptionFilter());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const env = configService.get<string>('RUNTIME');
  const serviceName = configService.get<string>('SERVICE_NAME');
  console.log(`runtime: ${env}\tport: ${port}\tserviceName: ${serviceName}`);
  app.use(express.static(join(__dirname, '..', 'public')));
  await app.listen(port);
}
bootstrap();
