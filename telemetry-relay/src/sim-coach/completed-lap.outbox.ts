import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import type { CompletedLapPayload } from "./completed-lap.types.ts";

function safeFileName(sourceLapId: string): string {
  return `${sourceLapId.replace(/[^a-zA-Z0-9._-]/g, "_")}.json`;
}

export class CompletedLapOutbox {
  private activeUpload?: Promise<{ uploaded: number; failed: number }>;
  private readonly directory: string;
  private readonly uploadUrl: string;
  private readonly telemetrySecret: string;

  constructor(directory: string, uploadUrl: string, telemetrySecret: string) {
    this.directory = directory;
    this.uploadUrl = uploadUrl;
    this.telemetrySecret = telemetrySecret;
  }

  async enqueue(payload: CompletedLapPayload): Promise<void> {
    await mkdir(this.directory, { recursive: true });

    const target = join(this.directory, safeFileName(payload.sourceLapId));
    try {
      await access(target);
      return;
    } catch {
      // The stable source lap id makes a repeated completion idempotent.
    }

    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporary, JSON.stringify(payload), "utf8");
    await rename(temporary, target);
  }

  async uploadPending(): Promise<{ uploaded: number; failed: number }> {
    if (this.activeUpload) return this.activeUpload;

    this.activeUpload = this.performUpload();
    try {
      return await this.activeUpload;
    } finally {
      this.activeUpload = undefined;
    }
  }

  private async performUpload(): Promise<{ uploaded: number; failed: number }> {
    await mkdir(this.directory, { recursive: true });
    const pendingFiles = (await readdir(this.directory))
      .filter((fileName) => fileName.endsWith(".json"))
      .sort();

    let uploaded = 0;
    let failed = 0;

    for (const fileName of pendingFiles) {
      const filePath = join(this.directory, fileName);

      try {
        const body = await readFile(filePath, "utf8");
        const response = await fetch(this.uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-telemetry-secret": this.telemetrySecret,
          },
          body,
        });

        if (!response.ok) {
          failed += 1;
          continue;
        }

        await unlink(filePath);
        uploaded += 1;
      } catch {
        failed += 1;
      }
    }

    return { uploaded, failed };
  }
}
