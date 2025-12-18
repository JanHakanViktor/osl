import { Box } from "@mui/material";
import AppBar from "../components/AppBar";
import HeroBanner from "../components/HeroBanner";
import RecentSessions from "../components/RecentSessions";
import Footer from "../components/Footer";
import MostPlayedCircuit from "../components/MostPlayedCircuit";
import ScoreBoard from "../components/ScoreBoard";
import "../index.css";
import SignUpDialog from "../components/auth/SignUpDialog";

function LandingPage() {
  return (
    <>
      <AppBar />
      <HeroBanner />

      <Box
        sx={{
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 2,
          p: 2,
          maxWidth: "1680px",
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
            podiumPlacement={[]}
            title="CLEAN LAPS RECORD"
          />
        </Box>
        <Box>
          <ScoreBoard
            title="SPEED TRAP"
            id={1}
            sessionId={42}
            topDrivers={[]}
            cleanLaps={0}
            topSpeed={342}
            podiumPlacement={[]}
          />
        </Box>
      </Box>
      <SignUpDialog />
      <Footer />
    </>
  );
}

export default LandingPage;
