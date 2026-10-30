/**
 * Runs a task at most once per interval: straight away when the last run is
 * older than the interval, otherwise once the interval has passed. Requests
 * in between share that one run.
 */
export class Throttle {
  private lastRunAt = -Infinity;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly intervalMs: number,
    private readonly task: () => void,
  ) {}

  request(): void {
    if (this.timer) return;

    const waitMs = this.lastRunAt + this.intervalMs - Date.now();
    if (waitMs <= 0) {
      this.run();
      return;
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      this.run();
    }, waitMs);
  }

  cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private run(): void {
    this.lastRunAt = Date.now();
    this.task();
  }
}
