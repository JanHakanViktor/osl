import { Box, Container, Typography } from "@mui/material";
import DriverChip, { type DriverProps } from "./DriverChip";
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
          backgroundImage:
            'radial-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.12)), url("/sessionbg.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "text.primary",
          border: "solid, 4px, red",
          borderRadius: "10px",
          pt: 3,
          pb: 1,
        }}
      >
        {mockedSessions
          .slice(0, 3)
          .map(({ id: sessionId, sessionTitle, drivers }) => (
            <Box key={sessionId} sx={{ mb: 2 }}>
              <Box sx={{ backgroundColor: "#4747478d", p: 1, borderRadius: 2 }}>
                <Typography variant="h5" color="#FFFFFF" fontWeight={"bold"}>
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
