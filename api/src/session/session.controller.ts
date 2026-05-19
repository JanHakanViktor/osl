import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateSessionDto } from 'src/session/session.dto';
import type { Request } from 'express';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req: Request, @Body() dto: CreateSessionDto) {
    return this.sessionService.create(req.session!.user!.id, dto);
  }

  @Post(':id/start')
  @UseGuards(AuthGuard)
  start(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.start(id, req.session!.user!.id);
  }

  @Post(':id/finish')
  @UseGuards(AuthGuard)
  finish(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.finish(id, req.session!.user!.id);
  }

  @Get('landing-summary')
  getLandingSummary() {
    return this.sessionService.getLandingSummary();
  }

  @Get(':id/overview')
  @UseGuards(AuthGuard)
  getOverview(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.getOverview(id, req.session!.user!.id);
  }

  @Get(':id/live')
  @UseGuards(AuthGuard)
  getLiveSession(@Req() req: Request, @Param('id') id: string) {
    return this.sessionService.getLiveSession(id, req.session!.user!.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  getSessionHistory(@Req() req: Request) {
    return this.sessionService.getSessionHistory(req.session!.user!.id);
  }
}
