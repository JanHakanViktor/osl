import type { Request } from 'express';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryAuthGuard } from 'src/telemetry/telemetry.guard';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('/realtime-relay')
  @UseGuards(TelemetryAuthGuard)
  async relay(@Body() payload: { type: string; data: any }) {
    await this.telemetryService.handleIncomingTelemetryPacket(
      payload.type,
      payload.data,
    );
    console.log('TELEMETERY RECEIVED:', payload.type);

    return { ok: true };
  }
}
