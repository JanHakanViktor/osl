import { Box, Typography } from "@mui/material";
import type { DriverProps } from "./DriverChip";
import DriverChip from "./DriverChip";
import PodiumImage from "./PodiumImage";

interface ScoreBoardProps {
  id: number;
  sessionId: number;
  topDrivers: DriverProps[];
  podiumPlacement: number;
  cleanLaps: number;
  topSpeed: number;
}

const ScoreBoard = ({ topDrivers, cleanLaps }: ScoreBoardProps) => {
  const rows = [0, 1, 2].map(
    (i) => topDrivers[i] ?? { id: `p-${i}`, name: `Driver ${i + 1}` } // TODO: REAL VALUES NEEDED
  );

  return (
    <>
      <Typography sx={{ p: 2, fontWeight: "bold" }} variant="h5">
        LONGEST CLEAN LAP STREAK
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          p: 2,
          boxSizing: "border-box",
          maxWidth: 980,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: 340,
          }}
        >
          {rows.map((driver) => (
            <Box
              key={driver.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PodiumImage size={28} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <DriverChip
                  id={driver.id}
                  name={driver.name}
                  team={driver.team ?? null}
                  avatarUrl={driver.avatarUrl ?? null}
                />
              </Box>
              <Box
                sx={{
                  fontSize: "0.95rem",
                  color: "text.secondary",
                  width: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  flex: 1,
                  flexGrow: 1,
                }}
              >
                Clean Laps: <strong>{cleanLaps}x</strong>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default ScoreBoard;
