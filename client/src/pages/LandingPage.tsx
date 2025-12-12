import { Box } from "@mui/material";
import AppBar from "../components/AppBar";
import HeroBanner from "../components/HeroBanner";
import RecentSessions from "../components/RecentSessions";
import Footer from "../components/Footer";
import MostPlayedCircuit from "../components/MostPlayedCircuit";
import ScoreBoard from "../components/ScoreBoard";

function LandingPage() {
  return (
    <>
      <AppBar />
      <HeroBanner />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 1,
          p: 2,
        }}
      >
        <Box>
          <RecentSessions />
        </Box>

        <Box>
          <MostPlayedCircuit />
        </Box>

        <Box>
          <ScoreBoard
            id={1}
            sessionId={42}
            topDrivers={[]}
            cleanLaps={7}
            topSpeed={342}
            podiumPlacement={}
          />
        </Box>
        <Box></Box>
      </Box>

      <Footer />
    </>
  );
}

export default LandingPage;
