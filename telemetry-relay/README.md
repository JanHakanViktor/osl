# Telemetry relay

The relay forwards live F1 25 UDP packets to the API and builds durable completed-lap payloads for the sim coach.

## Sim-coach configuration

- `TELEMETRY_SECRET`: shared secret accepted by the API.
- `SIM_COACH_URL`: completed-lap endpoint. Defaults to `http://localhost:3030/sim-coach/laps`.
- `SIM_COACH_OUTBOX`: local retry directory. Defaults to `./data/sim-coach-outbox`.
- `UDP_PORT`: F1 25 UDP port. Defaults to `20777`.

The collector accepts F1 25 packet format `2025`, packet version `1`, and session types Practice 1-3, Short Practice, and Time Trial. A lap remains in the outbox until the backend accepts it.
