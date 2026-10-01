import type {
  CreateTournamentPayload,
  RuleSetId,
  TournamentWeather,
} from "../../../types/tournament.types";

export const WIZARD_STEPS = ["settings", "rules", "drivers", "tracks"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const MIN_DRIVERS = 2;
export const MAX_DRIVERS = 12;
export const MAX_LAPS_PER_DRIVER = 20;
export const MAX_NAME_LENGTH = 60;

export type TournamentDraft = {
  name: string;
  weather: TournamentWeather;
  lapsPerDriver: number;
  cleanLapBonus: boolean;
  topSpeedBonus: boolean;
  ruleSetId: RuleSetId | null;
  driverIds: string[];
  circuitIds: number[];
};

export const initialTournamentDraft: TournamentDraft = {
  name: "",
  weather: "DRY",
  lapsPerDriver: 3,
  cleanLapBonus: false,
  topSpeedBonus: false,
  ruleSetId: null,
  driverIds: [],
  circuitIds: [],
};

type EditableSettings = Pick<
  TournamentDraft,
  | "name"
  | "weather"
  | "lapsPerDriver"
  | "cleanLapBonus"
  | "topSpeedBonus"
  | "ruleSetId"
>;

export type TournamentDraftAction =
  | { type: "update"; changes: Partial<EditableSettings> }
  | { type: "toggleDriver"; driverId: string }
  | { type: "toggleCircuit"; circuitId: number }
  | { type: "clearCircuits" };

function toggle<T>(items: T[], item: T, limit = Infinity): T[] {
  if (items.includes(item)) return items.filter((value) => value !== item);
  return items.length < limit ? [...items, item] : items;
}

export function tournamentDraftReducer(
  draft: TournamentDraft,
  action: TournamentDraftAction,
): TournamentDraft {
  switch (action.type) {
    case "update":
      return { ...draft, ...action.changes };
    case "toggleDriver":
      return {
        ...draft,
        driverIds: toggle(draft.driverIds, action.driverId, MAX_DRIVERS),
      };
    case "toggleCircuit":
      return {
        ...draft,
        circuitIds: toggle(draft.circuitIds, action.circuitId),
      };
    case "clearCircuits":
      return { ...draft, circuitIds: [] };
  }
}

/** Returns why the step cannot continue yet, or null when it is complete. */
export function validateStep(
  step: WizardStep,
  draft: TournamentDraft,
): string | null {
  switch (step) {
    case "settings":
      if (!draft.name.trim()) return "Give the tournament a name";
      if (draft.name.trim().length > MAX_NAME_LENGTH) {
        return `Keep the name under ${MAX_NAME_LENGTH} characters`;
      }
      if (
        !Number.isInteger(draft.lapsPerDriver) ||
        draft.lapsPerDriver < 1 ||
        draft.lapsPerDriver > MAX_LAPS_PER_DRIVER
      ) {
        return `Laps per driver must be between 1 and ${MAX_LAPS_PER_DRIVER}`;
      }
      return null;
    case "rules":
      return draft.ruleSetId ? null : "Pick a rule set";
    case "drivers":
      return draft.driverIds.length >= MIN_DRIVERS
        ? null
        : `Add at least ${MIN_DRIVERS} drivers`;
    case "tracks":
      return draft.circuitIds.length > 0 ? null : "Pick at least one track";
  }
}

export function firstInvalidStep(draft: TournamentDraft): WizardStep | null {
  return WIZARD_STEPS.find((step) => validateStep(step, draft) != null) ?? null;
}

export function toCreateTournamentPayload(
  draft: TournamentDraft,
): CreateTournamentPayload {
  if (!draft.ruleSetId) throw new Error("A rule set is required");

  return {
    name: draft.name.trim(),
    weather: draft.weather,
    lapsPerDriver: draft.lapsPerDriver,
    cleanLapBonus: draft.cleanLapBonus,
    topSpeedBonus: draft.topSpeedBonus,
    ruleSetId: draft.ruleSetId,
    driverIds: draft.driverIds,
    circuitIds: draft.circuitIds,
  };
}
