import {
  constants,
  F1TelemetryClient,
} from "@deltazeroproduction/f1-udp-parser";
import fetch from "node-fetch";

const { PACKETS } = constants;

const API_URL = "http://localhost:3030/telemetry/relay";

const client = new F1TelemetryClient({ port: 20777 });
function forward(eventName: string, data: any) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: eventName, data }),
  }).catch(console.error);
}
client.on(PACKETS.carTelemetry, (data) => forward("carTelemetry", data));

client.on(PACKETS.lapData, (data) => forward("lapData", data));

client.on(PACKETS.session, (data) => forward("session", data));

client.start();
console.log("Telemetry relay listening on 20777");
