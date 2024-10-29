import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export let app: NestApplication;

async function bootstrap() {
  app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 2323);
}
bootstrap();
