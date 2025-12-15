import { Body, Controller, Post } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('/realtime-relay')
  relay(@Body() payload: { type: string; data: any }) {
    this.telemetryService.handleIncomingTelemetryPacket(
      payload.type,
      payload.data,
    );
    console.log('TELEMETERY RECEIVED:', payload.type);

    return { ok: true };
  }
}
