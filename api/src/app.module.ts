import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from './telemetry/telemetry.module';
import { SessionModule } from 'src/telemetry/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');

        if (!uri) {
          throw new Error('MONGO_URL is not defined');
        }
        return { uri };
      },
    }),
    TelemetryModule,
    SessionModule,
  ],
})
export class AppModule {}
