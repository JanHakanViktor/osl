import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './session.schema';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]),
  ],
  providers: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
