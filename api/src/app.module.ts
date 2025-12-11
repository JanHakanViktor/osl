import { Module } from '@nestjs/common';

import { TelemetryModule } from './telemetry/telemetry.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TelemetryModule],
  controllers: [AppController],
  providers: [AppService, TelemetryModule],
})
export class AppModule {}
