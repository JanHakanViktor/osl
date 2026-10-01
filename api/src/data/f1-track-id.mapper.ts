const OSL_CIRCUIT_ID_BY_F1_TRACK_ID: Readonly<Record<number, number>> = {
  0: 0, // Melbourne -> Australia
  2: 2, // Shanghai -> China
  3: 22, // Sakhir -> Bahrain
  4: 7, // Catalunya -> Spain
  5: 5, // Monaco
  6: 6, // Montreal -> Canada
  7: 9, // Silverstone -> Great Britain
  9: 10, // Hungaroring -> Hungary
  10: 11, // Spa -> Belgium
  11: 13, // Monza -> Italy
  12: 15, // Singapore
  13: 1, // Suzuka -> Japan
  14: 21, // Abu Dhabi
  15: 16, // Texas -> United States
  16: 18, // Brazil
  17: 8, // Austria
  19: 17, // Mexico
  20: 14, // Baku -> Azerbaijan
  26: 12, // Zandvoort -> Netherlands
  27: 4, // Imola -> Emilia Romagna
  29: 23, // Jeddah -> Saudi Arabia
  30: 3, // Miami
  31: 19, // Las Vegas
  32: 20, // Losail -> Qatar
};

export function mapF1TrackIdToOslCircuitId(
  f1TrackId: number,
): number | undefined {
  return OSL_CIRCUIT_ID_BY_F1_TRACK_ID[f1TrackId];
}
