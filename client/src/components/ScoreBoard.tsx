import { Box, Typography } from "@mui/material";
import type { DriverProps } from "./DriverChip";
import DriverChip from "./DriverChip";
import PodiumImage from "./PodiumImage";

interface ScoreBoardProps {
  id: number;
  title: string;
  sessionId: number;
  topDrivers: DriverProps[];
  podiumPlacement: number[];
  cleanLaps: number;
  topSpeed: number;
}

const ScoreBoard = ({ topDrivers, cleanLaps, title }: ScoreBoardProps) => {
  const rows = [0, 1, 2].map(
    (i) => topDrivers[i] ?? { id: `p-${i}`, name: `Driver ${i + 1}` } // TODO: REAL VALUES NEEDED
  );

  return (
    <>
      <Typography sx={{ p: 2, fontWeight: "bold" }} variant="h5">
        {title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          p: 2,
          boxSizing: "border-box",
          maxWidth: 980,
          width: "100%",
          bgcolor: "#000000ff",
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: 340,
            flex: 1,
          }}
        >
          {rows.map((driver, index) => (
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
                <Typography
                  variant="h5"
                  sx={{ ml: 6, mr: 2, color: "#FFFFFF" }}
                >
                  {index + 1}
                </Typography>
                <PodiumImage size={50} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <DriverChip
                  id={driver.id}
                  name={driver.name}
                  team={driver.team ?? null}
                  avatarUrl={driver.avatarUrl ?? null}
                  sx={{
                    display: "flex",
                    ml: 6,
                    bgcolor: "#ffffff37",
                    p: 4,
                    "& .MuiTypography-root": {
                      flexDirection: "row",
                      fontWeight: 700,
                    },
                  }}
                />
              </Box>
              <Box sx={{ justifyContent: "space-between" }}>
                <Box
                  sx={{
                    fontSize: "0.95rem",
                    color: "#ff0000ff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    flex: 1,
                    flexGrow: 1,
                    p: 2,
                    bgcolor: "#FFFFFF",
                    borderRadius: "10px",
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      fontWeight: "bold",
                      fontSize: "20px",
                    }}
                  >
                    {cleanLaps}x
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default ScoreBoard;
