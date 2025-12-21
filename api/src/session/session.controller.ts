import { Controller, Post, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('create')
  createSession() {
    console.log('SessionController hit');
    return { ok: true };
  }
}
