import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(
    json({ limit: '10mb' }),
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SECRET!],
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    }),
  );

  await app.listen(3030);
}

void bootstrap();
