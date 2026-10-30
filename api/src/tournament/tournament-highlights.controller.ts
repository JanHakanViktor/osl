import { Controller, Get } from '@nestjs/common';
import type { LatestTournamentHighlightDto } from './dto/tournament-response.dto';
import { TournamentService } from './tournament.service';

/**
 * Public, read-only tournament highlights for the landing page. Kept apart
 * from TournamentController so that controller stays guarded as a whole.
 */
@Controller('tournament-highlights')
export class TournamentHighlightsController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get('latest')
  getLatest(): Promise<LatestTournamentHighlightDto> {
    return this.tournamentService.getLatestHighlight();
  }
}
