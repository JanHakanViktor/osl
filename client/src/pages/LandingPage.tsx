import { Box } from "@mui/material";
import AppBar from "../components/AppBar";
import HeroBanner from "../components/HeroBanner";
import RecentSessions from "../components/RecentSessions";
import Footer from "../components/Footer";
import MostPlayedCircuit from "../components/MostPlayedCircuit";

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
          minHeight: "68vh",
          alignItems: "stretch",
          "& > div": {
            height: "100%",
          },
        }}
      >
        <Box>
          <RecentSessions />
        </Box>

        <Box>
          <MostPlayedCircuit />
        </Box>

        <Box></Box>
        <Box></Box>
      </Box>

      <Footer />
    </>
  );
}

export default LandingPage;
