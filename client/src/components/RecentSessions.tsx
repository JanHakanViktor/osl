import { Box, Container } from "@mui/material";

export interface RecentSession {
  id: string;
  sessionTitle: string;
  topDrivers: [];
}

const RecentSessions = () => {
  const mockedSessions = [
    {
      id: "s1",
      sessionTitle: "GBG GP 2025",
      topDrivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s2",
      sessionTitle: "MAJORNA GP 2026",
      topDrivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s3",
      sessionTitle: "HITTARP GP 2026",
      topDrivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
    {
      id: "s4",
      sessionTitle: "asdas GP 2026",
      topDrivers: [
        { id: "d1", name: "Viktor Petersson", team: "McLaren" },
        { id: "d2", name: "Tim Andersson", team: "Kick Sauber" },
        { id: "d3", name: "Carlos Sainz", team: "Williams" },
      ],
    },
  ];

  return (
    <>
      <Container sx={{ backgroundColor: "grey", color: "white" }}>
        {mockedSessions.slice(0, 3).map((session) => (
          <Box key={session.id}>
            <Box sx={{ backgroundColor: "green" }}>
              {session.sessionTitle}
              <Box>{session.topDrivers.map((d) => d.name)}</Box>
              <Box>{session.topDrivers.map((d) => d.team)}</Box>
            </Box>
          </Box>
        ))}
      </Container>
    </>
  );
};

export default RecentSessions;
