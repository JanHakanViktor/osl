import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class TelemetryAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const secret = req.headers['x-telemetry-secret'];

    if (typeof secret !== 'string' || secret !== process.env.TELEMETRY_SECRET) {
      throw new UnauthorizedException('Invalid telemetry source');
    }

    return true;
  }
}
