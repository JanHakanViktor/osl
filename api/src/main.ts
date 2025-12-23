import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import cookieSession from 'cookie-session';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const sameSite = process.env.SAME_SITE === 'none' ? 'none' : 'lax';

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
      name: '__Host-session',
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
