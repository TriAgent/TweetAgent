import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export let app: NestApplication;

async function bootstrap() {
  app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: '*',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3345);
}
bootstrap();
