import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

//bootstrap-funktionen som startar NestJS-applikationen.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '10mb' }));

  await app.listen(process.env.PORT ?? 3030);

  console.log(
    `Nest server listening on http://localhost:${process.env.PORT ?? 3030}`,
  );
}

void bootstrap();
