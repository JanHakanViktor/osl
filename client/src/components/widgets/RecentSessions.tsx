import { Box, Container, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getOslAppShell } from "../../theme";
import type { DriverProps } from "../DriverChip";
import DriverChip from "../DriverChip";

export interface RecentSession {
  id: string;
  sessionTitle: string;
  drivers: DriverProps[];
}

const RecentSessions = () => {
  const mockedSessions: RecentSession[] = [
    {
      id: "s1",
      sessionTitle: "GBG GP 2025",
      drivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s2",
      sessionTitle: "MAJORNA GP 2026",
      drivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s3",
      sessionTitle: "HITTARP GP 2026",
      drivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s4",
      sessionTitle: "asdas GP 2026",
      drivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
  ];

  return (
    <>
      <Typography sx={{ p: 2, fontWeight: "bold" }} variant="h5">
        RECENT SESSIONS
      </Typography>
      <Container
        sx={{
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(
              getOslAppShell(theme).surface,
              0.92,
            )}, ${alpha(
              getOslAppShell(theme).surfaceStrong,
              0.76,
            )}), url("/sessionbg.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "common.white",
          borderRadius: "10px",
          border: (theme) => `1px solid ${getOslAppShell(theme).border}`,
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
          pt: 3,
          pb: 1,
        }}
      >
        {mockedSessions
          .slice(0, 3)
          .map(({ id: sessionId, sessionTitle, drivers }) => (
            <Box key={sessionId} sx={{ mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: (theme) =>
                    getOslAppShell(theme).surfaceGlass,
                  border: (theme) =>
                    `1px solid ${getOslAppShell(theme).border}`,
                  p: 1,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h5"
                  color="common.white"
                  fontWeight={"bold"}
                >
                  {sessionTitle}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {drivers.slice(0, 3).map(({ id, name, team, avatarUrl }) => (
                    <DriverChip
                      key={id}
                      id={id}
                      name={name}
                      team={team}
                      avatarUrl={avatarUrl}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ))}
      </Container>
    </>
  );
};

export default RecentSessions;
