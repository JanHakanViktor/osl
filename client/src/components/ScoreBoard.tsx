import { Box } from "@mui/material";
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

const ScoreBoard = ({
  sessionId,
  topDrivers,
  cleanLaps,
  topSpeed,
}: ScoreBoardProps) => {
  const rows = [0, 1, 2].map(
    (i) => topDrivers[i] ?? { id: `p-${i}`, name: `Driver ${i + 1}` } // TODO: REAL VALUES NEEDED
  );

  return (
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
          </Box>
        ))}
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          width: 200,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ fontSize: "0.95rem", color: "text.secondary" }}>
          Clean Laps: <strong>{cleanLaps}</strong>
        </Box>
        <Box sx={{ fontSize: "0.95rem", color: "text.secondary" }}>
          Top Speed: <strong>{topSpeed} km/h</strong>
        </Box>
        <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
          Session: {sessionId}
        </Box>
      </Box>
    </Box>
  );
};

export default ScoreBoard;
