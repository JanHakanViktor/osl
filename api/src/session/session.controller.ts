import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateSessionDto } from 'src/session/session.dto';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateSessionDto) {
    return this.sessionService.create(req.session!.user!.id, dto);
  }

  @Post(':id/start')
  start(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.start(id, req.session!.user!.id);
  }
}
