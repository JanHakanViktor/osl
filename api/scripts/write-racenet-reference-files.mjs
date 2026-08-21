import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function writeRaceNetReferenceFiles({
  references,
  audit,
  outputDirectory,
  extractedAt,
}) {
  await mkdir(outputDirectory, { recursive: true });

  const files = [];
  for (const reference of references) {
    const trackAudit = audit.find(
      (entry) => entry.track === reference.track.name,
    );
    const selectedAttemptIndex = trackAudit?.attempts.findIndex(
      (attempt) =>
        attempt.valid === true && attempt.rank === reference.entry.rank,
    );
    const rejectedFasterCandidates =
      selectedAttemptIndex == null || selectedAttemptIndex < 1
        ? []
        : trackAudit.attempts.slice(0, selectedAttemptIndex);
    const fileName = `${String(reference.track.circuitId).padStart(2, '0')}-${slugify(reference.track.name)}.json`;
    const payload = {
      schemaVersion: 1,
      source: 'racenet',
      game: 'F1 25',
      extractedAt,
      circuitId: reference.track.circuitId,
      circuitName: reference.track.name,
      raceNetTrackId: reference.track.raceNetTrackId,
      leaderboard: {
        ssid: reference.entry.ssid,
        driverName: reference.entry.displayname,
        rank: reference.entry.rank,
        timeMs: reference.entry.timeMs,
        assists: reference.entry.assists,
        equalPerformance: reference.entry.isEqualPerformance,
      },
      validation: {
        criteriaVersion: 1,
        rejectedFasterCandidates,
      },
      raw: reference.ghost,
    };

    await writeFile(
      join(outputDirectory, fileName),
      `${JSON.stringify(payload, null, 2)}\n`,
      'utf8',
    );
    files.push(fileName);
  }

  return files.sort();
}
