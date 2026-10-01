import { COUNTRIES } from "../../data/countries";
import { TEAMS } from "../../data/team";
import type { Team } from "../../types/team.types";

export type DriverCountry = {
  /** ISO 3166-1 alpha-2, upper-case. */
  code: string;
  /** Short English name, e.g. "United Kingdom". */
  name: string;
};

/** The codes drivers can pick at sign-up. */
const SIGN_UP_COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** The driver's country, or null when none was chosen or the code is unknown. */
export function findCountry(code: string | null): DriverCountry | null {
  const upperCode = code?.toUpperCase();
  if (!upperCode || !SIGN_UP_COUNTRY_CODES.has(upperCode)) return null;

  return { code: upperCode, name: regionNames.of(upperCode) ?? upperCode };
}

/** The driver's team, or null when none was chosen or the id is unknown. */
export function findTeam(teamId: string | null): Team | null {
  return TEAMS.find((team) => team.id === teamId) ?? null;
}
