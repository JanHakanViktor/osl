# Default Sim Coach references

OSL ships one F1 25 RaceNet reference for each of its 24 standard circuits.
The JSON files in `data/` contain the unmodified RaceNet ghost response plus
the leaderboard identity and selection audit used to choose it.

The selection performed on 2026-08-16 required:

- a driver from the official 2025 F1 Sim Racing World Championship roster;
- a valid, equal-performance dry F1 lap;
- no driving assists (`assistsEverUsed` is false and no assist IDs other than
  RaceNet's baseline ID `4` are present);
- complete, finite, monotonic telemetry channels; and
- no neutral/reverse gear sample above 40 km/h away from the lap boundaries.

Faster candidates that failed validation are recorded in the corresponding
JSON file under `validation.rejectedFasterCandidates`.

| Circuit | Driver | RaceNet rank | Lap time |
| --- | --- | ---: | ---: |
| Australia | Otis Lawrence | 4 | 1:14.833 |
| Japan | Alfie Butcher | 3 | 1:26.050 |
| China | Thomas Ronhaar | 5 | 1:31.018 |
| Miami | Brendon Leigh | 5 | 1:24.814 |
| Emilia Romagna | Thomas Ronhaar | 1 | 1:13.169 |
| Monaco | Otis Lawrence | 10 | 1:08.237 |
| Canada | Tom Manley | 18 | 1:08.562 |
| Spain | Thomas Ronhaar | 8 | 1:11.287 |
| Austria | Tamás Gál | 4 | 1:03.088 |
| Great Britain | Ismael Fahssi | 8 | 1:25.316 |
| Hungary | Ismael Fahssi | 1 | 1:14.162 |
| Belgium | Otis Lawrence | 8 | 1:40.806 |
| Netherlands | Thomas Ronhaar | 5 | 1:07.946 |
| Italy | Shanaka Clay | 6 | 1:17.651 |
| Azerbaijan | István Puki | 208 | 1:38.564 |
| Singapore | Declan Barrett | 4 | 1:27.175 |
| United States | Otis Lawrence | 1 | 1:30.266 |
| Mexico | Alfie Butcher | 3 | 1:14.017 |
| Brazil | Thomas Ronhaar | 5 | 1:06.708 |
| Las Vegas | Lucas Blakeley | 8 | 1:30.563 |
| Qatar | István Puki | 4 | 1:20.418 |
| Abu Dhabi | Alfie Butcher | 7 | 1:21.841 |
| Bahrain | Thomas Ronhaar | 4 | 1:26.583 |
| Saudi Arabia | Otis Lawrence | 4 | 1:26.053 |

RaceNet credentials and session tokens are never stored in these assets.
