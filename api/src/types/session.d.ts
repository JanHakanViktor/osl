import 'express';
import 'cookie-session';
import { SessionUser } from '../auth/auth.types';

declare module 'express' {
  interface Request {
    session?: {
      user?: SessionUser;
    } | null;
  }
}

declare module 'cookie-session' {
  interface SessionData {
    user?: SessionUser;
  }
}
