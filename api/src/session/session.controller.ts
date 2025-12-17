import { Controller, Post, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @UseGuards(AuthGuard)
  @Post()
  createSession() {}
}
