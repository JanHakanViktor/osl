import {
  constants,
  F1TelemetryClient,
} from "@deltazeroproduction/f1-udp-parser";
import fetch from "node-fetch";

const { PACKETS } = constants;

const API_URL = "http://localhost:3030/telemetry/relay";

const client = new F1TelemetryClient({
  port: 20777,
});

function bigintSafeReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

function safeJsonify(obj: unknown) {
  return JSON.stringify(obj, bigintSafeReplacer);
}

function forward(eventName: string, data: unknown) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: safeJsonify({ type: eventName, data }),
  }).catch(console.error);
}

client.on(PACKETS.carTelemetry, (data: any) => forward("carTelemetry", data));

client.on(PACKETS.lapData, (data: any) => forward("lapData", data));

client.on(PACKETS.session, (data: any) => forward("session", data));

client.start();
console.log("🏁 Telemetry relay listening on UDP 20777");
