import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, ButtonBase, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../../../theme";
import type { RuleSet, RuleSetId } from "../../../../types/tournament.types";

type RuleSetStepProps = {
  ruleSets: RuleSet[];
  loading: boolean;
  selectedId: RuleSetId | null;
  onSelect: (ruleSetId: RuleSetId) => void;
};

export default function RuleSetStep({
  ruleSets,
  loading,
  selectedId,
  onSelect,
}: RuleSetStepProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        gap: 2.5,
      }}
    >
      {loading &&
        [0, 1, 2].map((index) => (
          <Skeleton key={index} variant="rounded" height={360} />
        ))}

      {ruleSets.map((ruleSet) => {
        const selected = ruleSet.id === selectedId;

        return (
          <ButtonBase
            key={ruleSet.id}
            onClick={() => onSelect(ruleSet.id)}
            aria-pressed={selected}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "flex-start",
              textAlign: "left",
              p: 3,
              minHeight: 340,
              borderRadius: 2,
              bgcolor: "background.paper",
              border: (theme) =>
                `2px solid ${
                  selected
                    ? getOslAppShell(theme).accent
                    : getOslAppShell(theme).border
                }`,
              boxShadow: (theme) =>
                selected
                  ? getOslAppShell(theme).accentGlow
                  : "0 18px 42px rgba(0, 0, 0, 0.28)",
              transition: "border-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: (theme) => alpha(getOslAppShell(theme).accent, 0.7),
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {ruleSet.name}
              </Typography>
              {selected && (
                <CheckCircleIcon
                  sx={{ color: (theme) => getOslAppShell(theme).accent }}
                />
              )}
            </Stack>
            <Typography
              sx={{
                mb: 2.5,
                fontWeight: 800,
                color: (theme) => getOslAppShell(theme).accent,
              }}
            >
              {ruleSet.tagline}
            </Typography>
            <Stack spacing={1.25}>
              {ruleSet.rules.map((rule) => (
                <Box
                  key={rule}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: (theme) => alpha(theme.palette.common.white, 0.06),
                  }}
                >
                  <Typography variant="body2">{rule}</Typography>
                </Box>
              ))}
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
