import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const sameSite = process.env.SAME_SITE === 'none' ? 'none' : 'lax';
  const cookieName =
    process.env.NODE_ENV === 'production' ? '__Host-session' : 'session';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = ['https://osl-f1.com', 'https://www.osl-f1.com'];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  });

  app.use(
    json({ limit: '10mb' }),
    cookieSession({
      name: cookieName,
      keys: [process.env.COOKIE_SECRET!],
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: sameSite === 'none',
      sameSite,
    }),
  );

  await app.listen(3030);
}

void bootstrap();
