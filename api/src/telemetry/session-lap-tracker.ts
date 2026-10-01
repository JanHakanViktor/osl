// src/telemetry/session-lap-tracker.ts

export type TrackedLap = {
  lapNum: number;
  invalid: boolean;
};

/**
 * Follows the player's laps for the session that is receiving lap data.
 *
 * F1 25 reports `m_currentLapInvalid` for the lap in progress, so the packet
 * where `m_currentLapNum` increments already describes the new lap. The tracker
 * remembers the flag while each lap is driven, keeps it once set, and holds on
 * to the lap that just finished so it can be judged after the line.
 *
 * A lap only becomes a completed lap when the tracker saw it in progress, so
 * laps the game finished before the session started are never reported.
 */
export class SessionLapTracker {
  private sessionId: string | null = null;
  private currentLap: TrackedLap | null = null;
  private completedLap: TrackedLap | null = null;

  observe(sessionId: string, lapNum: number, lapInvalid: boolean): void {
    if (sessionId !== this.sessionId) {
      this.sessionId = sessionId;
      this.currentLap = null;
      this.completedLap = null;
    }

    const trackedLap = this.findTrackedLap(lapNum);

    if (trackedLap) {
      // Packets for the lap that just finished can arrive late; they still
      // describe that lap and must not restart tracking.
      trackedLap.invalid ||= lapInvalid;
      return;
    }

    const crossedLine = this.currentLap?.lapNum === lapNum - 1;

    this.completedLap = crossedLine ? this.currentLap : null;
    this.currentLap = { lapNum, invalid: lapInvalid };
  }

  /** Returns the lap that just finished, if it was watched in progress. */
  findCompletedLap(
    sessionId: string,
    lapNum: number,
  ): Readonly<TrackedLap> | null {
    if (sessionId !== this.sessionId) return null;

    return this.completedLap?.lapNum === lapNum ? this.completedLap : null;
  }

  private findTrackedLap(lapNum: number): TrackedLap | null {
    if (this.currentLap?.lapNum === lapNum) return this.currentLap;
    if (this.completedLap?.lapNum === lapNum) return this.completedLap;

    return null;
  }
}
