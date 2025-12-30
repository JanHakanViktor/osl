import { Module } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { SessionTelemetryService } from 'src/telemetry/session-telemetry.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from 'src/session/session.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryGateway, TelemetryService, SessionTelemetryService],
})
export class TelemetryModule {}
