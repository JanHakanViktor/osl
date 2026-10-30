import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { LiveTimingController } from './live-timing.controller';
import { LiveTimingGateway } from './live-timing.gateway';
import { LiveTimingService } from './live-timing.service';
import {
  TimingSession,
  TimingSessionSchema,
} from './schemas/timing-session.schema';
import { TimingSessionRepository } from './timing-session.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimingSession.name, schema: TimingSessionSchema },
    ]),
    TelemetryModule,
  ],
  controllers: [LiveTimingController],
  providers: [LiveTimingService, LiveTimingGateway, TimingSessionRepository],
})
export class LiveTimingModule {}
