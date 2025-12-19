import 'express';
import { SessionUser } from '../auth/auth.types';
import 'cookie-session';

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
