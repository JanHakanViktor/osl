import { F1TelemetryClient, constants } from '@deltazeroproduction/f1-udp-parser';
import fetch from 'node-fetch';

const API_URL = 'https://your-api.up.railway.app'; // env later

const client = new F1TelemetryClient({
  port: 20777,
  address: '0.0.0.0',
  skipParsing: false,
});

client.on(constants.PACKETS.lapData, async (packet) => {
  try {
    await fetch(`${API_URL}/telemetry/lap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packet),
    });
  } catch (err) {
    console.error('Failed to forward lap data', err);
  }
});

client.start();
console.log('🏁 UDP ingest listening on 20777');