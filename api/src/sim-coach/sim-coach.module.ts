import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../session/session.schema';
import { SimCoachAnalysisEngine } from './analysis/sim-coach-analysis.engine';
import { SimCoachController } from './sim-coach.controller';
import { SimCoachService } from './sim-coach.service';
import { SimCoachLap, SimCoachLapSchema } from './schemas/sim-coach-lap.schema';
import { DefaultReferenceLapRepository } from './references/default-reference-lap.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimCoachLap.name, schema: SimCoachLapSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [SimCoachController],
  providers: [
    SimCoachService,
    SimCoachAnalysisEngine,
    DefaultReferenceLapRepository,
  ],
})
export class SimCoachModule {}
