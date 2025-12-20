import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  app.set('trust proxy', 1);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      if (origin === 'https://osl-f1.vercel.app') {
        return callback(null, true);
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  app.use(
    json({ limit: '10mb' }),
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SECRET!],
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    }),
  );

  await app.listen(3030);
}

void bootstrap();
