import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieSession from 'cookie-session';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(
    json({ limit: '10mb' }),
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SECRET!],
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3030);
}

void bootstrap();
