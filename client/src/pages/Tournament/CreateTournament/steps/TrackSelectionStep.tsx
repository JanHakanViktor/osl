import { Box, Button, ButtonBase, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CircuitLibrary from "../../../../data/circuit";
import { getOslAppShell } from "../../../../theme";
import TournamentPanel from "../../components/TournamentPanel";

type TrackSelectionStepProps = {
  selectedIds: number[];
  onToggle: (circuitId: number) => void;
  onClear: () => void;
};

const circuits = CircuitLibrary.map((circuit) => ({
  id: Number(circuit.trackId),
  grandPrix: circuit.grandPrix,
  name: circuit.circuit,
  image: circuit.image,
}));

export default function TrackSelectionStep({
  selectedIds,
  onToggle,
  onClear,
}: TrackSelectionStepProps) {
  const selectedCircuits = selectedIds
    .map((id) => circuits.find((circuit) => circuit.id === id))
    .filter((circuit) => circuit != null);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <Box
        role="group"
        aria-label="Tracks in F1 25"
        sx={{
          p: 2,
          borderRadius: 2,
          overflowX: "auto",
          display: "grid",
          gridAutoFlow: "column",
          gridTemplateRows: { xs: "auto", md: "repeat(2, auto)" },
          gridAutoColumns: { xs: "68%", sm: "38%", md: "24%" },
          gap: 1.5,
          scrollSnapType: "x mandatory",
          scrollbarColor: (theme) =>
            `${getOslAppShell(theme).accent} ${alpha(theme.palette.common.white, 0.12)}`,
          bgcolor: (theme) => getOslAppShell(theme).surface,
          border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
          boxShadow: "inset 0 18px 32px rgba(0, 0, 0, 0.45)",
        }}
      >
        {circuits.map((circuit) => {
          const order = selectedIds.indexOf(circuit.id);
          const selected = order !== -1;

          return (
            <ButtonBase
              key={circuit.id}
              onClick={() => onToggle(circuit.id)}
              aria-pressed={selected}
              aria-label={`${circuit.grandPrix} – ${circuit.name}`}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
                p: 2,
                minHeight: 200,
                borderRadius: 2,
                scrollSnapAlign: "start",
                textAlign: "left",
                color: "common.white",
                bgcolor: (theme) =>
                  selected
                    ? alpha(getOslAppShell(theme).accent, 0.18)
                    : "#000",
                border: (theme) =>
                  `2px solid ${
                    selected ? getOslAppShell(theme).accent : "transparent"
                  }`,
                transition: "border-color 0.2s ease, background-color 0.2s ease",
                "&:hover": {
                  borderColor: (theme) => alpha(getOslAppShell(theme).accent, 0.6),
                },
              }}
            >
              <Typography sx={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1.15rem" }}>
                {circuit.grandPrix}
              </Typography>
              <Box
                component="img"
                src={circuit.image}
                alt=""
                sx={{
                  width: "100%",
                  height: 110,
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                  opacity: selected ? 1 : 0.72,
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                {circuit.name}
              </Typography>
              {selected && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    minWidth: 28,
                    height: 28,
                    px: 0.75,
                    borderRadius: 1,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    bgcolor: (theme) => getOslAppShell(theme).accent,
                  }}
                >
                  {order + 1}
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Box>

      <TournamentPanel
        title="Currently selected"
        action={
          selectedIds.length > 0 && (
            <Button size="small" onClick={onClear}>
              Clear
            </Button>
          )
        }
      >
        {selectedCircuits.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            Pick the tracks you want to race.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {selectedCircuits.map((circuit) => (
              <Typography
                key={circuit.id}
                sx={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1.25rem" }}
              >
                {circuit.grandPrix}
              </Typography>
            ))}
          </Stack>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
          The race order is drawn at random when the tournament starts.
        </Typography>
      </TournamentPanel>
    </Box>
  );
}
