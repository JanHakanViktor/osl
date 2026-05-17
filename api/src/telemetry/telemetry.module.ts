import { Module } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionTelemetryService } from './session-telemetry.service';
import { Session, SessionSchema } from '../session/session.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryGateway, TelemetryService, SessionTelemetryService],
})
export class TelemetryModule {}
