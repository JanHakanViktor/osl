import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { UsersModule } from '../users/users.module';
import { MathRandomSource } from './domain/random-source';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { TournamentController } from './tournament.controller';
import { TournamentGateway } from './tournament.gateway';
import { TournamentHeatService } from './tournament-heat.service';
import { TournamentHighlightsController } from './tournament-highlights.controller';
import { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';
import { TOURNAMENT_RANDOM_SOURCE } from './tournament.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
    ]),
    UsersModule,
    TelemetryModule,
  ],
  controllers: [TournamentController, TournamentHighlightsController],
  providers: [
    TournamentService,
    TournamentHeatService,
    TournamentRepository,
    TournamentGateway,
    { provide: TOURNAMENT_RANDOM_SOURCE, useClass: MathRandomSource },
  ],
})
export class TournamentModule {}
