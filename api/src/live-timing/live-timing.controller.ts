import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import type {
  LiveTimingCurrentDto,
  TimingBoardDto,
  TimingSessionSummaryDto,
} from './dto/live-timing.dto';
import { TimingSessionParamsDto } from './dto/timing-session-params.dto';
import { LiveTimingService } from './live-timing.service';

@Controller('live-timing')
@UseGuards(AuthGuard)
export class LiveTimingController {
  constructor(private readonly liveTimingService: LiveTimingService) {}

  /** The session the relay is sending now; both are null before any. */
  @Get('current')
  getCurrent(): LiveTimingCurrentDto {
    return this.liveTimingService.getCurrent();
  }

  @Get('sessions')
  listSessions(): Promise<TimingSessionSummaryDto[]> {
    return this.liveTimingService.listSessions();
  }

  @Get('sessions/:sessionUid')
  getSession(@Param() params: TimingSessionParamsDto): Promise<TimingBoardDto> {
    return this.liveTimingService.getSession(params.sessionUid);
  }
}
