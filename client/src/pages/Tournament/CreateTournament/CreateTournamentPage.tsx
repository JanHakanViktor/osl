import { useReducer, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  createTournament,
  getDriverOptions,
  getRuleSets,
} from "../../../service/tournament";
import TournamentPageHeader from "../components/TournamentPageHeader";
import { tournamentKeys } from "../hooks/useTournament";
import { tournamentPath } from "../tournamentRouting";
import DriverSelectionStep from "./steps/DriverSelectionStep";
import RuleSetStep from "./steps/RuleSetStep";
import TournamentSettingsStep from "./steps/TournamentSettingsStep";
import TrackSelectionStep from "./steps/TrackSelectionStep";
import {
  initialTournamentDraft,
  toCreateTournamentPayload,
  tournamentDraftReducer,
  validateStep,
  WIZARD_STEPS,
  type WizardStep,
} from "./tournamentDraft";

const STEP_COPY: Record<WizardStep, { label: string; title: string }> = {
  settings: { label: "Setup", title: "Create tournament" },
  rules: { label: "Rule set", title: "Select rule set" },
  drivers: { label: "Drivers", title: "Driver registration" },
  tracks: { label: "Tracks", title: "Select race tracks" },
};

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, dispatch] = useReducer(
    tournamentDraftReducer,
    initialTournamentDraft,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [showStepError, setShowStepError] = useState(false);

  const ruleSets = useQuery({
    queryKey: tournamentKeys.ruleSets(),
    queryFn: getRuleSets,
    staleTime: Infinity,
  });
  const drivers = useQuery({
    queryKey: tournamentKeys.drivers(),
    queryFn: getDriverOptions,
  });
  const create = useMutation({
    mutationFn: createTournament,
    onSuccess: (tournament) => {
      queryClient.setQueryData(tournamentKeys.detail(tournament.id), tournament);
      void queryClient.invalidateQueries({ queryKey: tournamentKeys.list() });
      navigate(tournamentPath.standings(tournament.id));
    },
  });

  const step = WIZARD_STEPS[stepIndex];
  const stepError = validateStep(step, draft);
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const loadError = ruleSets.error ?? drivers.error;

  const handleContinue = () => {
    if (stepError) {
      setShowStepError(true);
      return;
    }

    setShowStepError(false);
    if (isLastStep) {
      create.mutate(toCreateTournamentPayload(draft));
    } else {
      setStepIndex((index) => index + 1);
    }
  };

  const handleBack = () => {
    setShowStepError(false);
    if (stepIndex === 0) {
      navigate(tournamentPath.list());
    } else {
      setStepIndex((index) => index - 1);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stepper activeStep={stepIndex} alternativeLabel sx={{ mb: 4 }}>
        {WIZARD_STEPS.map((wizardStep) => (
          <Step key={wizardStep}>
            <StepLabel>{STEP_COPY[wizardStep].label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <TournamentPageHeader
        eyebrow={`Step ${stepIndex + 1} of ${WIZARD_STEPS.length}`}
        title={STEP_COPY[step].title}
      />

      {step === "settings" && (
        <TournamentSettingsStep
          draft={draft}
          onChange={(changes) => dispatch({ type: "update", changes })}
        />
      )}
      {step === "rules" && (
        <RuleSetStep
          ruleSets={ruleSets.data ?? []}
          loading={ruleSets.isLoading}
          selectedId={draft.ruleSetId}
          onSelect={(ruleSetId) =>
            dispatch({ type: "update", changes: { ruleSetId } })
          }
        />
      )}
      {step === "drivers" && (
        <DriverSelectionStep
          drivers={drivers.data ?? []}
          loading={drivers.isLoading}
          selectedIds={draft.driverIds}
          onToggle={(driverId) => dispatch({ type: "toggleDriver", driverId })}
        />
      )}
      {step === "tracks" && (
        <TrackSelectionStep
          selectedIds={draft.circuitIds}
          onToggle={(circuitId) => dispatch({ type: "toggleCircuit", circuitId })}
          onClear={() => dispatch({ type: "clearCircuits" })}
        />
      )}

      <Stack spacing={2} sx={{ mt: 4 }}>
        {showStepError && stepError && <Alert severity="warning">{stepError}</Alert>}
        {loadError && <Alert severity="error">{loadError.message}</Alert>}
        {create.error && <Alert severity="error">{create.error.message}</Alert>}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            pt: 3,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={handleContinue}
            disabled={create.isPending}
            sx={{ minWidth: 180, minHeight: 48 }}
          >
            {isLastStep
              ? create.isPending
                ? "Creating…"
                : "Create tournament"
              : "Continue"}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
