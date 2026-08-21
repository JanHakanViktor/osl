import "dotenv/config";
import {
  constants,
  F1TelemetryClient,
} from "@deltazeroproduction/f1-udp-parser";

const { PACKETS } = constants;

const API_URL =
  process.env.API_URL ?? "http://localhost:3030/telemetry/realtime-relay";

const UDP_PORT = Number(process.env.UDP_PORT ?? 20777);

const client = new F1TelemetryClient({ port: UDP_PORT });
const packetStats = {
  raw: 0,
  parsed: 0,
  forwarded: 0,
  failed: 0,
  byType: {} as Record<string, number>,
  lastHeader: null as null | {
    packetFormat?: number;
    packetId?: number;
    packetVersion?: number;
  },
};

function bigintSafeReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

function safeJsonify(obj: unknown) {
  return JSON.stringify(obj, bigintSafeReplacer);
}

async function forward(eventName: string, data: unknown) {
  packetStats.parsed += 1;
  packetStats.byType[eventName] = (packetStats.byType[eventName] ?? 0) + 1;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-telemetry-secret": process.env.TELEMETRY_SECRET!,
      },
      body: safeJsonify({ type: eventName, data }),
    });

    if (!response.ok) {
      packetStats.failed += 1;
      const body = await response.text().catch(() => "");
      console.error(
        `Failed to forward ${eventName}: ${response.status} ${response.statusText}`,
        body
      );
      return;
    }

    packetStats.forwarded += 1;
  } catch (error) {
    packetStats.failed += 1;
    console.error(`Failed to forward ${eventName}:`, error);
  }
}

client.on(PACKETS.carTelemetry, (data: any) => forward("carTelemetry", data));

client.on(PACKETS.motion, (data: any) => forward("motion", data));

client.on(PACKETS.lapData, (data: any) => forward("lapData", data));

client.on(PACKETS.sessionHistory, (data: any) =>
  forward("sessionHistory", data)
);

client.on(PACKETS.session, (data: any) => forward("session", data));

client.socket?.on("message", (message) => {
  packetStats.raw += 1;

  try {
    const header = F1TelemetryClient.parsePacketHeader(message);
    packetStats.lastHeader = {
      packetFormat: header.m_packetFormat,
      packetId: header.m_packetId,
      packetVersion: header.m_packetVersion,
    };
  } catch {
    packetStats.lastHeader = null;
  }
});

client.start();
console.log(`Telemetry relay listening on UDP ${UDP_PORT}`);
console.log(`Forwarding to ${API_URL}`);
console.log(
  "If raw stays 0 while driving, F1 25 is not sending UDP packets to this relay."
);

setInterval(() => {
  console.log(
    `[relay] raw=${packetStats.raw} parsed=${packetStats.parsed} forwarded=${packetStats.forwarded} failed=${packetStats.failed} types=${JSON.stringify(
      packetStats.byType
    )} lastHeader=${JSON.stringify(packetStats.lastHeader)}`
  );
}, 5000);
