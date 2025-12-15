import { Body, Controller, Post } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post('relay')
  relay(@Body() payload: { type: string; data: any }) {
    this.telemetryService.handleIncomingPacket(payload.type, payload.data);
    console.log('📥 TELEMETRY SUCCESSFULLY HANDLED:', payload.type);

    return { ok: true };
  }
}
