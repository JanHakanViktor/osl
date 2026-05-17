import { Box, Stack, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import type { LandingSummary } from "../../types/session.types";

type ImprovementTrend = LandingSummary["improvementTrend"];

const formatMs = (ms?: number | null) => {
  if (!ms) return "--:--.---";

  const totalMs = Math.max(0, Math.round(ms));
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = totalMs % 1000;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}.${String(
    milliseconds
  ).padStart(3, "0")}`;
};

const DriverImprovementTrend = ({ trend }: { trend: ImprovementTrend }) => {
  const sessions = trend?.sessions ?? [];
  const hasTrend = sessions.length > 0;
  const firstLap = sessions[0]?.fastestLapMs ?? 0;
  const bestLap = sessions.reduce(
    (best, session) => Math.min(best, session.fastestLapMs),
    firstLap || 0
  );
  const improvement = firstLap && bestLap ? firstLap - bestLap : 0;

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 300,
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        bgcolor: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" sx={{ color: "#d90000", fontWeight: 800 }}>
            Driver trend
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Improvement Curve
          </Typography>
          <Typography color="text.secondary">
            {trend
              ? `${trend.driverName} at ${trend.circuitName}`
              : "No recorded trend yet"}
          </Typography>
        </Box>
      </Stack>

      <Box>
        <Typography color="text.secondary">
          {hasTrend ? "Fastest lap improved by" : "Fastest lap"}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: "2.1rem", sm: "2.8rem" },
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          {hasTrend ? `${(improvement / 1000).toFixed(3)}s` : "--:--.---"}
        </Typography>
      </Box>

      <Box
        sx={{
          minHeight: 196,
          mt: "auto",
          "& .MuiChartsAxis-tickLabel": {
            fill: "#4d4d4d !important",
            fontSize: 12,
          },
          "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": {
            stroke: "rgba(0,0,0,0.22)",
          },
        }}
      >
        {hasTrend ? (
          <LineChart
            height={196}
            margin={{ left: 72, right: 24, top: 24, bottom: 36 }}
            xAxis={[
              {
                scaleType: "point",
                data: sessions.map((session) => session.label),
              },
            ]}
            yAxis={[
              {
                valueFormatter: (value: number) => formatMs(Number(value)),
              },
            ]}
            series={[
              {
                data: sessions.map((session) => session.fastestLapMs),
                color: "#7b2cff",
                curve: "monotoneX",
                valueFormatter: (value: number | null) => formatMs(value),
              },
            ]}
            grid={{ horizontal: true }}
          />
        ) : (
          <Stack
            sx={{
              height: 196,
              borderRadius: 1.5,
              bgcolor: "rgba(0,0,0,0.04)",
              color: "text.secondary",
            }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography>No lap data recorded</Typography>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default DriverImprovementTrend;
