/**
 * Runs async tasks one at a time, in the order they were queued. Used so a
 * host action and live telemetry never update the same tournament at once.
 */
export class SerialTaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}
