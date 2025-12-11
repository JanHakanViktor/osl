import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

//bootstrap-funktionen som startar NestJS-applikationen.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule); //skapar en NestJS-applikation baserat på AppModule
  app.use(json({ limit: '10mb' })); //startar applikationen och lyssnar på angiven port.
  await app.listen(process.env.PORT ?? 3030);
  console.log(
    `Nest server listening on http://localhost:${process.env.PORT ?? 3030}`,
  );
}

async function start(): Promise<void> {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Failed to start application', error);
    process.exit(1);
  }
}

void start();
