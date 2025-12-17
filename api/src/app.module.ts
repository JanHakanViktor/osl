import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from './telemetry/telemetry.module';
import { SessionModule } from 'src/session/session.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');
        const dbName = config.get<string>('MONGO_DB_NAME');

        if (!uri) {
          throw new Error('MONGO_URL is not defined');
        }
        return { uri, dbName };
      },
    }),
    TelemetryModule,
    SessionModule,
    UsersModule,
  ],
})
export class AppModule {}
