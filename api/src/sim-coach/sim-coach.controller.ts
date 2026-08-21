import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { TelemetryAuthGuard } from '../telemetry/telemetry.guard';
import { CompletedLapDto } from './dto/completed-lap.dto';
import { SelectReferenceDto } from './dto/select-reference.dto';
import { SimCoachService } from './sim-coach.service';

@Controller('sim-coach')
export class SimCoachController {
  constructor(private readonly simCoachService: SimCoachService) {}

  @Post('laps')
  @UseGuards(TelemetryAuthGuard)
  ingest(@Body() dto: CompletedLapDto) {
    return this.simCoachService.ingest(dto);
  }

  @Get('sessions/:sessionId/laps')
  @UseGuards(AuthGuard)
  getSessionLaps(@Req() req: Request, @Param('sessionId') sessionId: string) {
    return this.simCoachService.getSessionLaps(
      sessionId,
      req.session!.user!.id,
    );
  }

  @Put('laps/:lapId/reference')
  @UseGuards(AuthGuard)
  selectReference(
    @Req() req: Request,
    @Param('lapId') lapId: string,
    @Body() dto: SelectReferenceDto,
  ) {
    return this.simCoachService.selectReference(
      lapId,
      dto.referenceLapId,
      req.session!.user!.id,
    );
  }

  @Delete('laps/:lapId/reference')
  @UseGuards(AuthGuard)
  clearReference(@Req() req: Request, @Param('lapId') lapId: string) {
    return this.simCoachService.clearReference(lapId, req.session!.user!.id);
  }

  @Get('laps/:lapId/analysis')
  @UseGuards(AuthGuard)
  analyze(@Req() req: Request, @Param('lapId') lapId: string) {
    return this.simCoachService.analyze(lapId, req.session!.user!.id);
  }
}
